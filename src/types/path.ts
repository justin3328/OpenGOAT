import { ResourceProfile } from './resource.js';

export interface ResourceFit {
  time:     'perfect' | 'good' | 'stretch' | 'difficult';
  capital:  'perfect' | 'good' | 'stretch' | 'difficult';
  skills:   'perfect' | 'good' | 'stretch' | 'difficult';
  network:  'perfect' | 'good' | 'stretch' | 'difficult';
  overall:  number;   // 0–100
}

export interface PathMilestone {
  week:        number;
  description: string;
  metric:      number;
  unit:        string;
}

export interface FirstAction {
  description: string;      // exactly what to do
  timeRequired: number;     // minutes
  output: string;           // what exists after doing this
}

export interface GoalPath {
  id:                   string;
  name:                 string;
  tagline:              string;        // one sentence
  whyFastest:           string;        // specific to their resource profile
  confidenceScore:      number;        // 0–100
  weeksToClose:         number;        // estimated given their resources
  weeklyHoursRequired:  number;
  capitalRequired:      number;
  skillGaps:            string[];      // what they need that they don't have
  resourceFit:          ResourceFit;   // how well their resources match
  milestones:           PathMilestone[];
  firstAction:          FirstAction;   // what they can do in the next 2 hours
  rank:                 1 | 2 | 3 | 4 | 5;
}
