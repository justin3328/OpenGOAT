export interface HistoricalScore {
  id:            string;
  goalId:        string;
  weekNumber:    number;
  velocityScore: number;    // 0-100
  consistency:   number;    // 0-100
  momentum:      number;    // 0-100
  pathFit:       number;    // 0-100
  total:         number;    // 0-100
  rank:          'Ghost' | 'Recruit' | 'Operator' | 'Apex';
  xp:            number;
  gapAtWeek:     number;
  scoredAt:      Date;
}
