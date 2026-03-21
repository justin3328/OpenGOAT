export interface Intervention {
  id:               string;
  goalId:           string;
  triggeredBy:      'stalled-48h' | 'stalled-5d' | 'velocity-drop';
  question:         string;          // the one question GoatBrain asks
  userResponse:     string;          // their plain text answer
  constraintType:   'time' | 'skill' | 'resource' | 'clarity' | 'external' | 'motivation';
  unlockAction:     string;          // the one thing to do
  createdAt:        Date;
  resolved:         boolean;
}
