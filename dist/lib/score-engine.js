export function calculateScore(missions, weekNumber) {
    const total = missions.length;
    const completed = missions.filter(m => m.status === 'complete').length;
    const missed = missions.filter(m => m.status === 'missed').length;
    const execution = total > 0 ? Math.round((completed / total) * 100) : 0;
    const consistency = Math.max(0, 100 - missed * 15);
    const capitalVelocity = Math.min(100, execution * 1.1);
    const reflection = weekNumber > 1 ? 10 : 0;
    const composite = total === 0 ? 0 : Math.round(execution * 0.4 +
        consistency * 0.3 +
        capitalVelocity * 0.2 +
        reflection * 0.1);
    const xp = completed * 100 + Math.floor(composite / 10) * 50;
    const rank = composite >= 90 ? 'Apex' :
        composite >= 70 ? 'Ghost' :
            composite >= 40 ? 'Operator' : 'Recruit';
    return { execution, consistency, capitalVelocity, reflection, total: composite, rank, xp };
}
