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
        for pred_class, pred_proba in zip(pred_classes, pred_probas):
            probabilities = {cls: float(prob) for cls, prob in zip(classes, pred_proba)}
            results.append({
                "riskClass": pred_class.lower(),
                "probabilities": probabilities
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
