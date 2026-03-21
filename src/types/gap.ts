export interface GapEntry {
  id:          string;
  goalId:      string;
  value:       number;
  loggedAt:    Date;
  note?:       string;
}

export interface GapStatus {
  current:           number;
  target:            number;
  unit:              string;
  percentClosed:     number;
  gap:               number;
  velocity7d:        number;    // movement per week over last 7 days
  velocity30d:       number;    // movement per week over last 30 days
  targetVelocity:    number;    // needed to hit goal by deadline
  projectedWeeks:    number;    // at current velocity
  status:            'on-track' | 'behind' | 'stalled' | 'crisis' | 'ahead';
  daysSinceMovement: number;
  projectedCompletionDate: string;
  isBehindSchedule:  boolean;
}
