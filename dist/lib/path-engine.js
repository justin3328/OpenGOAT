export function calculateGap(current, target, deadline) {
    const weeksRemaining = Math.max(1, Math.ceil((deadline.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)));
    const velocity = (target - current) / weeksRemaining;
    return {
        category: 'income',
        current,
        target,
        unit: 'USD/month',
        deadline,
        velocity
    };
}
export function scorePathBySpeed(path, gap) {
    const urgencyWeight = gap.velocity > 0 ? gap.velocity / (gap.target - gap.current) : 0;
    const timeScore = Math.max(0, 100 - path.estimatedWeeks * 2);
    const confidenceScore = path.confidenceScore;
    return Math.round((timeScore * 0.4) + (confidenceScore * 0.4) + (urgencyWeight * 100 * 0.2));
}
export function rankPaths(paths, gap) {
    return [...paths]
        .map(p => ({ ...p, confidenceScore: scorePathBySpeed(p, gap) }))
        .sort((a, b) => b.confidenceScore - a.confidenceScore);
}
