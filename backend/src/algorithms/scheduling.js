const calculateCrewScore = (crew, flight, pastWorkload, restHours) => {
    // AI Scoring Logic
    // Score = (Rest Compliance * 0.4) + (Workload Balance * 0.4) + (Availability * 0.2)

    let restScore = Math.min(restHours / 12, 1) * 100; // 12 hours rest is ideal
    let workloadScore = Math.max(0, (40 - pastWorkload) / 40) * 100; // 40 hours max per week
    let availabilityScore = crew.status === 'active' ? 100 : 0;

    return (restScore * 0.4) + (workloadScore * 0.4) + (availabilityScore * 0.2);
};

const findBestCrew = (availableCrew, flight, previousAssignments) => {
    return availableCrew
        .map(crew => {
            const pastWorkload = previousAssignments[crew.id] || 0;
            const restHours = 24; // Simplified for now, should calculate from last flight
            const score = calculateCrewScore(crew, flight, pastWorkload, restHours);
            return { ...crew, score };
        })
        .sort((a, b) => b.score - a.score);
};

module.exports = { calculateCrewScore, findBestCrew };
