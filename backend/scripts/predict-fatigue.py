import sys
import json
import joblib
import pandas as pd

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Missing model path or feature vector"}))
        sys.exit(1)

    model_path = sys.argv[1]
    features_json = sys.argv[2]

    try:
        # Load the saved joblib artifact (contains pipeline, feature columns, etc)
        artifact = joblib.load(model_path)
        pipeline = artifact['pipeline']
        feature_columns = artifact['featureColumns']

        # Parse features (could be a single object or a list of objects)
        input_data = json.loads(features_json)
        is_list = isinstance(input_data, list)

        if is_list:
            df = pd.DataFrame(input_data)
        else:
            df = pd.DataFrame([input_data])

        # Align columns & impute missing
        df = df.reindex(columns=feature_columns, fill_value=0)

        # Run prediction
        pred_classes = pipeline.predict(df)
        pred_probas = pipeline.predict_proba(df)
        classes = list(pipeline.named_steps['model'].classes_)

        results = []
        for index, (pred_class, pred_proba) in enumerate(zip(pred_classes, pred_probas)):
            probabilities = {cls: float(prob) for cls, prob in zip(classes, pred_proba)}
            row = df.iloc[index]

            # XAI Risk Driver calculation based on feature thresholds
            drivers = []
            duty_24 = row.get('dutyHours24', 0)
            rest_hours = row.get('hoursSinceLastRest', 0)
            consec_days = row.get('consecutiveDutyDays', 0)
            tz_shift = row.get('timezoneCrossings', 0)

            if duty_24 > 8:
                drivers.append({'factor': 'dutyHours24', 'label': f"High 24h Duty ({duty_24:.1f}h)", 'impact': '+25%'})
            if rest_hours < 12:
                drivers.append({'factor': 'hoursSinceLastRest', 'label': f"Short Rest Window ({rest_hours:.1f}h)", 'impact': '+20%'})
            if consec_days >= 4:
                drivers.append({'factor': 'consecutiveDutyDays', 'label': f"{int(consec_days)} Consecutive Duty Days", 'impact': '+18%'})
            if row.get('isLateNightDeparture', 0) == 1 or row.get('isEarlyMorningDeparture', 0) == 1:
                drivers.append({'factor': 'circadianShift', 'label': 'Circadian Rhythm / Night Shift', 'impact': '+15%'})
            if tz_shift >= 2:
                drivers.append({'factor': 'timezoneCrossings', 'label': f"Timezone Shift ({int(tz_shift)} zones)", 'impact': '+12%'})

            if not drivers:
                drivers.append({'factor': 'adequateRest', 'label': 'Adequate Rest & Balanced Roster', 'impact': '-20%'})

            results.append({
                "riskClass": pred_class.lower(),
                "probabilities": probabilities,
                "riskDrivers": drivers[:3]
            })

        print(json.dumps({
            "results": results if is_list else results[0],
            "status": "success"
        }))
    except Exception as e:
        print(json.dumps({"error": str(e), "status": "error"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
