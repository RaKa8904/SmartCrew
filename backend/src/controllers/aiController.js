const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ARTIFACT_DIR = path.join(__dirname, '../../artifacts/fatigue');
const MANIFEST_PATH = path.join(ARTIFACT_DIR, 'fatigue_model_v1_manifest.json');
const METRICS_PATH = path.join(ARTIFACT_DIR, 'fatigue_model_v1_metrics.json');
const GENERATE_SCRIPT = path.join(__dirname, '../../scripts/generate-fatigue-dataset.js');
const TRAIN_SCRIPT = path.join(__dirname, '../../scripts/train-fatigue-model.py');

let isRetraining = false;

const getModelStatus = async (req, res) => {
    try {
        let manifest = {};
        let metrics = {};

        if (fs.existsSync(MANIFEST_PATH)) {
            manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
        }
        if (fs.existsSync(METRICS_PATH)) {
            metrics = JSON.parse(fs.readFileSync(METRICS_PATH, 'utf-8'));
        }

        return res.json({
            isRetraining,
            manifest,
            metrics,
            status: 'online'
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error reading model status', error: error.message });
    }
};

const retrainModel = async (req, res) => {
    if (isRetraining) {
        return res.status(400).json({ message: 'Model retraining is already in progress' });
    }

    isRetraining = true;

    // Run dataset generation first, then python retraining script asynchronously
    execFile('node', [GENERATE_SCRIPT], (genErr, genStdout, genStderr) => {
        if (genErr) {
            console.error('Dataset generation failed during retrain:', genErr);
            isRetraining = false;
            return;
        }

        execFile('python', [TRAIN_SCRIPT], (trainErr, trainStdout, trainStderr) => {
            isRetraining = false;
            if (trainErr) {
                console.error('Python retraining failed:', trainErr);
            } else {
                console.log('Model retraining completed successfully:', trainStdout);
            }
        });
    });

    return res.json({
        message: 'Model retraining triggered successfully on active database records.',
        isRetraining: true
    });
};

module.exports = {
    getModelStatus,
    retrainModel
};
