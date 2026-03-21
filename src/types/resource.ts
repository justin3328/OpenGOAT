export interface ResourceProfile {
  time: {
    hoursPerDay:        number;
    peakHours:          'morning' | 'afternoon' | 'evening';
    daysPerWeek:        number;
    hardConstraints:    string[];
  };
  capital: {
    deployable:         number;        // $ available now
    monthlyIncome:      number;        // ongoing income
    runway:             number;        // months if all-in
    willingToSpend:     boolean;       // time vs money tradeoff
  };
  skills: string[];                    // free text list
  tools: string[];                     // platforms/tools they already use
  triedBefore: string[];               // what failed and why
  unfairAdvantage: string;             // their X factor
  network: {
    hasExistingAudience: boolean;
    audienceSize:        number;
    platforms:           string[];
    keyConnections:      string[];     // people who've done this
    communities:         string[];
  };
  assets: string[];                    // existing leverage they have
}
