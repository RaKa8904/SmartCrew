const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

const ARTIFACT_DIR = path.join(__dirname, '../../artifacts/fatigue');
const MANIFEST_PATH = path.join(ARTIFACT_DIR, 'fatigue_model_v1_manifest.json');
const METRICS_PATH = path.join(ARTIFACT_DIR, 'fatigue_model_v1_metrics.json');
const GENERATE_SCRIPT = path.join(__dirname, '../../scripts/generate-fatigue-dataset.js');
const TRAIN_SCRIPT = path.join(__dirname, '../../scripts/train-fatigue-model.py');

let isRetraining = false;
let lastAutoRetrainedAt = new Date().toISOString();
let nextAutoRetrainAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

const triggerAutoRetrainInternal = () => {
    if (isRetraining) return;
    isRetraining = true;
    console.log('[AUTO-RETRAIN] 24-Hour Automated ML Retraining triggered on live DB records...');

    execFile('node', [GENERATE_SCRIPT], (genErr) => {
        if (genErr) {
            console.error('[AUTO-RETRAIN] Dataset generation failed:', genErr);
            isRetraining = false;
            return;
        }

        execFile('python', [TRAIN_SCRIPT], (trainErr, trainStdout) => {
            isRetraining = false;
            lastAutoRetrainedAt = new Date().toISOString();
            nextAutoRetrainAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
            if (trainErr) {
                console.error('[AUTO-RETRAIN] Python model training failed:', trainErr);
            } else {
                console.log('[AUTO-RETRAIN] 24-Hour Automated ML Model Retrain complete:', trainStdout ? trainStdout.trim() : 'OK');
            }
        });
    });
};

const startAutoRetrainScheduler = () => {
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    setInterval(() => {
        triggerAutoRetrainInternal();
    }, TWENTY_FOUR_HOURS);
    console.log('🤖 24-Hour Automated ML Retraining Service initialized (Daily schedule).');
};

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
            autoSchedule: '24 Hours (Daily Live Sync)',
            lastAutoRetrainedAt,
            nextAutoRetrainAt,
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

    triggerAutoRetrainInternal();

    return res.json({
        message: 'Manual ML Model Retraining triggered on active database records.',
        isRetraining: true
    });
};

module.exports = {
    getModelStatus,
    retrainModel,
    startAutoRetrainScheduler
};
