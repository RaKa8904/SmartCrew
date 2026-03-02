const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Default rules to seed if the table is empty
const DEFAULT_RULES = [
    { name: 'Max Daily Duty Hours', value: 12, unit: 'hrs', description: 'Maximum consecutive hours a crew member can work in a 24-hour period.' },
    { name: 'Min Rest Period', value: 10, unit: 'hrs', description: 'Minimum rest time required between two consecutive duty periods.' },
    { name: 'Max Weekly Duty Hours', value: 40, unit: 'hrs', description: 'Maximum total duty hours allowed per rolling 7-day week.' },
    { name: 'Min Crew Per Flight', value: 3, unit: 'pers', description: 'Minimum number of crew members (passengers + pilots) for standard flights.' },
];

// Auto-seed default rules if none exist - called on server startup
const seedDefaultRules = async () => {
    const count = await prisma.rule.count();
    if (count === 0) {
        for (const rule of DEFAULT_RULES) {
            await prisma.rule.create({ data: rule });
        }
        console.log('✅ Default scheduling rules seeded into DB');
    }
};

// GET /api/rules
const getRules = async (req, res) => {
    try {
        const rules = await prisma.rule.findMany({ orderBy: { id: 'asc' } });
        res.json(rules);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// PUT /api/rules/:id  (admin only)
const updateRule = async (req, res) => {
    const { id } = req.params;
    const { value } = req.body;

    if (value === undefined || value === null || isNaN(Number(value))) {
        return res.status(400).json({ message: 'A valid numeric value is required.' });
    }

    try {
        const rule = await prisma.rule.update({
            where: { id: parseInt(id) },
            data: { value: Number(value) },
        });
        res.json(rule);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Rule not found.' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getRules, updateRule, seedDefaultRules };
