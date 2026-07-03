from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

import joblib
import numpy as np
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy.engine import make_url
from sqlalchemy import create_engine, text
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT_DIR = ROOT / 'artifacts' / 'fatigue'
MODEL_PATH = ARTIFACT_DIR / 'fatigue_model_v1.pkl'
METRICS_PATH = ARTIFACT_DIR / 'fatigue_model_v1_metrics.json'
MANIFEST_PATH = ARTIFACT_DIR / 'fatigue_model_v1_manifest.json'

FEATURE_COLUMNS = [
    'dutyHours24',
    'dutyHours7d',
    'dutyHours28d',
    'hoursSinceLastRest',
    'consecutiveDutyDays',
    'timezoneCrossings',
    'nightFlightCount',
    'departureLocalHour',
    'arrivalLocalHour',
    'isEarlyMorningDeparture',
    'isLateNightDeparture',
    'isOvernightArrival',
]

LABEL_ORDER = ['low', 'medium', 'high']


def load_environment_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text(encoding='utf-8-sig').splitlines():
        line = raw_line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue

        key, value = line.split('=', 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            os.environ[key] = value


def load_dataset() -> pd.DataFrame:
    load_environment_file(ROOT / '.env')
    load_environment_file(ROOT.parent / '.env')
    load_dotenv(dotenv_path=str(ROOT / '.env'), override=True)
    load_dotenv(dotenv_path=str(ROOT.parent / '.env'), override=True)

    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        raise RuntimeError('DATABASE_URL is required to train the fatigue model.')

    parsed_url = make_url(database_url)
    cleaned_query = dict(parsed_url.query)
    cleaned_query.pop('schema', None)
    engine = create_engine(parsed_url.set(query=cleaned_query))
    query = text(
        'SELECT "sampleKey", "crewName", "crewType", qualification, "dutyDate", '
        '"departureTime", "arrivalTime", origin, destination, "flightNumber", '
        '"aircraftType", "featureVector", "labelScore", "labelClass", "noiseApplied", '
        '"dataSource", "modelVersion", "createdAt" '
        'FROM "FatigueTrainingSample" '
        'ORDER BY "dutyDate" ASC, "createdAt" ASC'
    )

    with engine.connect() as connection:
        frame = pd.read_sql_query(query, connection)

    if frame.empty:
        raise RuntimeError('No fatigue training samples were found. Generate the dataset first.')

    return frame


def expand_features(frame: pd.DataFrame) -> pd.DataFrame:
    feature_rows = frame['featureVector'].apply(lambda value: json.loads(value) if isinstance(value, str) else value)
    feature_frame = pd.json_normalize(feature_rows)
    feature_frame = feature_frame.reindex(columns=FEATURE_COLUMNS)
    feature_frame = feature_frame.copy()

    for column in FEATURE_COLUMNS:
        feature_frame[column] = pd.to_numeric(feature_frame[column], errors='coerce')

    feature_frame = feature_frame.fillna(0)
    feature_frame['isEarlyMorningDeparture'] = feature_frame['isEarlyMorningDeparture'].astype(float)
    feature_frame['isLateNightDeparture'] = feature_frame['isLateNightDeparture'].astype(float)
    feature_frame['isOvernightArrival'] = feature_frame['isOvernightArrival'].astype(float)
    return feature_frame


def prepare_xy(frame: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    features = expand_features(frame)
    labels = frame['labelClass'].astype(str).str.lower()
    return features, labels


def time_split(features: pd.DataFrame, labels: pd.Series, frame: pd.DataFrame, train_ratio: float = 0.8):
    split_index = max(1, int(len(frame) * train_ratio))
    if split_index >= len(frame):
        split_index = len(frame) - 1

    x_train = features.iloc[:split_index].reset_index(drop=True)
    x_test = features.iloc[split_index:].reset_index(drop=True)
    y_train = labels.iloc[:split_index].reset_index(drop=True)
    y_test = labels.iloc[split_index:].reset_index(drop=True)
    return x_train, x_test, y_train, y_test, split_index


def build_models() -> dict[str, Pipeline]:
    return {
        'logistic_regression': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('scaler', StandardScaler()),
            ('model', LogisticRegression(max_iter=2000, class_weight='balanced')),
        ]),
        'random_forest': Pipeline([
            ('imputer', SimpleImputer(strategy='median')),
            ('model', RandomForestClassifier(
                n_estimators=300,
                random_state=42,
                class_weight='balanced_subsample',
                min_samples_leaf=2,
            )),
        ]),
    }


def compute_auc(model: Pipeline, x_test: pd.DataFrame, y_test: pd.Series) -> float | None:
    if len(set(y_test)) < 2:
        return None

    probabilities = model.predict_proba(x_test)
    classes = list(model.named_steps['model'].classes_)
    label_positions = [classes.index(label) for label in LABEL_ORDER if label in classes]

    if len(label_positions) < 2:
        return None

    y_true = pd.get_dummies(y_test).reindex(columns=classes, fill_value=0)
    try:
        return float(roc_auc_score(y_true, probabilities, multi_class='ovr', average='macro'))
    except ValueError:
        return None


def evaluate_model(name: str, model: Pipeline, x_train: pd.DataFrame, x_test: pd.DataFrame, y_train: pd.Series, y_test: pd.Series) -> dict[str, Any]:
    model.fit(x_train, y_train)
    predictions = model.predict(x_test)
    probabilities = model.predict_proba(x_test)

    metrics = {
        'modelName': name,
        'accuracy': float(accuracy_score(y_test, predictions)),
        'f1Macro': float(f1_score(y_test, predictions, average='macro', zero_division=0)),
        'f1Weighted': float(f1_score(y_test, predictions, average='weighted', zero_division=0)),
        'confusionMatrix': confusion_matrix(y_test, predictions, labels=LABEL_ORDER).tolist(),
        'classificationReport': classification_report(y_test, predictions, labels=LABEL_ORDER, zero_division=0, output_dict=True),
        'rocAucMacro': compute_auc(model, x_test, y_test),
        'predictedDistribution': pd.Series(predictions).value_counts().reindex(LABEL_ORDER, fill_value=0).to_dict(),
    }

    if hasattr(model.named_steps['model'], 'coef_'):
        coefficients = model.named_steps['model'].coef_
        class_weights = {}
        for class_index, class_name in enumerate(model.named_steps['model'].classes_):
            weight_pairs = sorted(
                zip(FEATURE_COLUMNS, coefficients[class_index]),
                key=lambda item: abs(item[1]),
                reverse=True,
            )
            class_weights[class_name] = [
                {'feature': feature, 'weight': float(weight)}
                for feature, weight in weight_pairs[:5]
            ]
        metrics['topLinearFactors'] = class_weights

    if hasattr(model.named_steps['model'], 'feature_importances_'):
        importances = model.named_steps['model'].feature_importances_
        importance_pairs = sorted(
            zip(FEATURE_COLUMNS, importances),
            key=lambda item: item[1],
            reverse=True,
        )
        metrics['topTreeFactors'] = [
            {'feature': feature, 'importance': float(importance)}
            for feature, importance in importance_pairs[:5]
        ]

    metrics['probabilityShape'] = list(probabilities.shape)
    return metrics


def build_manifest(best_metrics: dict[str, Any], dataset_rows: int, split_index: int, train_end: str, test_start: str) -> dict[str, Any]:
    return {
        'artifactVersion': 'fatigue_model_v1',
        'modelPath': str(MODEL_PATH),
        'metricsPath': str(METRICS_PATH),
        'datasetRows': dataset_rows,
        'trainRows': split_index,
        'testRows': dataset_rows - split_index,
        'trainEndDutyDate': train_end,
        'testStartDutyDate': test_start,
        'selectedModel': best_metrics['modelName'],
        'selectedMetric': 'f1Macro',
        'labelOrder': LABEL_ORDER,
        'featureColumns': FEATURE_COLUMNS,
        'metricsSummary': {
            'accuracy': best_metrics['accuracy'],
            'f1Macro': best_metrics['f1Macro'],
            'f1Weighted': best_metrics['f1Weighted'],
            'rocAucMacro': best_metrics['rocAucMacro'],
        },
    }


def main() -> None:
    frame = load_dataset()
    features, labels = prepare_xy(frame)
    x_train, x_test, y_train, y_test, split_index = time_split(features, labels, frame)

    if y_test.empty:
        raise RuntimeError('Time split produced an empty test set; add more synthetic rows first.')

    models = build_models()
    evaluations = [evaluate_model(name, model, x_train, x_test, y_train, y_test) for name, model in models.items()]
    evaluations.sort(key=lambda item: (item['f1Macro'], item['accuracy']), reverse=True)
    best = evaluations[0]
    best_model = models[best['modelName']]

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            'pipeline': best_model,
            'featureColumns': FEATURE_COLUMNS,
            'labelOrder': LABEL_ORDER,
            'modelVersion': 'fatigue_model_v1',
            'heuristicVersion': 'heuristic-v1',
            'selectedModel': best['modelName'],
        },
        MODEL_PATH,
    )

    train_end = frame.iloc[split_index - 1]['dutyDate'].isoformat() if split_index > 0 else frame.iloc[0]['dutyDate'].isoformat()
    test_start = frame.iloc[split_index]['dutyDate'].isoformat() if split_index < len(frame) else frame.iloc[-1]['dutyDate'].isoformat()

    metrics_bundle = {
        'artifactVersion': 'fatigue_model_v1',
        'datasetRows': len(frame),
        'trainRows': split_index,
        'testRows': len(frame) - split_index,
        'featureColumns': FEATURE_COLUMNS,
        'labelOrder': LABEL_ORDER,
        'evaluations': evaluations,
        'selectedModel': best['modelName'],
        'selectedMetrics': {
            'accuracy': best['accuracy'],
            'f1Macro': best['f1Macro'],
            'f1Weighted': best['f1Weighted'],
            'rocAucMacro': best['rocAucMacro'],
            'confusionMatrix': best['confusionMatrix'],
            'classificationReport': best['classificationReport'],
        },
        'timeSplit': {
            'trainEndDutyDate': train_end,
            'testStartDutyDate': test_start,
        },
    }

    MANIFEST_PATH.write_text(json.dumps(build_manifest(best, len(frame), split_index, train_end, test_start), indent=2), encoding='utf-8')
    METRICS_PATH.write_text(json.dumps(metrics_bundle, indent=2), encoding='utf-8')

    print(f"Selected model: {best['modelName']}")
    print(f"Accuracy: {best['accuracy']:.4f}")
    print(f"F1 macro: {best['f1Macro']:.4f}")
    print(f"F1 weighted: {best['f1Weighted']:.4f}")
    if best['rocAucMacro'] is not None:
        print(f"ROC AUC macro: {best['rocAucMacro']:.4f}")
    print(f"Saved model to: {MODEL_PATH}")
    print(f"Saved metrics to: {METRICS_PATH}")


if __name__ == '__main__':
    main()