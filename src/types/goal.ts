export interface Goal {
  id:          string;
  statement:   string;
  category:    string;
  currentVal:  number;
  targetVal:   number;
  unit:        string;
  deadline:    string; // YYYY-MM-DD
  activePath?: string;
  status:      'active' | 'completed' | 'paused';
  createdAt:   Date;
}
