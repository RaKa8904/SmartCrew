/**
 * Crew Scoring Algorithm
 * Score = (Rest Compliance * 0.4) + (Workload Balance * 0.4) + (Availability * 0.2)
 * 
 * crew.restHours should be pre-calculated by the caller (actual hours since last flight)
 */

const calculateCrewScore = (crew, flight, workloadMap, idealRestHours = 12, maxWeeklyHours = 40) => {
    // Rest compliance: ideal is 12+ hours rest. Score drops below ideal.
    const restHours = crew.restHours ?? 24;
    const restScore = Math.min(restHours / idealRestHours, 1) * 100;

    // Workload balance: favor crew with fewer scheduled hours
    const pastWorkload = workloadMap[crew.id] ?? 0;
    const workloadScore = Math.max(0, (maxWeeklyHours - pastWorkload) / maxWeeklyHours) * 100;

    // Availability: active = 100, anything else = 0
    const availabilityScore = crew.status === 'active' ? 100 : 0;

    // Crew type preference for long-haul vs short-haul
    const flightDuration = (new Date(flight.arrivalTime) - new Date(flight.departureTime)) / 3600000;
    const isLongHaul = flightDuration >= 6;
    const qualificationScore = (() => {
        const qual = crew.qualification || '';
        if (isLongHaul && (qual.includes('Long') || qual.includes('Senior') || qual.toLowerCase().includes('captain'))) return 100;
        if (!isLongHaul && (qual.includes('Short') || qual.includes('First Officer'))) return 80;
        return 50;
    })();

    return (restScore * 0.35) + (workloadScore * 0.35) + (availabilityScore * 0.15) + (qualificationScore * 0.15);
};

const findBestCrew = (availableCrew, flight, workloadMap, rules = {}) => {
    const idealRest = rules.minRestHours || 12;
    const maxWeekly = rules.maxWeeklyHours || 40;

    return availableCrew
        .map(crew => {
            const score = calculateCrewScore(crew, flight, workloadMap, idealRest, maxWeekly);
            return { ...crew, score };
        })
        .sort((a, b) => b.score - a.score);
};

module.exports = { calculateCrewScore, findBestCrew };
