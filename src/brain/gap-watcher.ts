import { GapStatus } from '../types/index.js';

export type WatcherDecision = 'silent' | 'watching' | 'intervening';

export class GapWatcher {
  /**
   * Evaluates the gap status and determines whether GoatBrain should stay silent,
   * watch (ask 1 question), or intervene (crisis mode).
   */
  static evaluateGap(status: GapStatus): WatcherDecision {
    // Determine target velocity thresholds
    const velocityRatio = status.targetVelocity > 0 ? (status.velocity7d / status.targetVelocity) : 1;
    
    // CRISIS INTERVENING MODE: hasn't moved in 5+ days OR (velocity < 40% of target AND is behind schedule)
    if (status.daysSinceMovement >= 5 || (velocityRatio < 0.4 && status.isBehindSchedule)) {
      return 'intervening';
    }
    
    // WATCHING MODE: hasn't moved in 48h OR velocity < 60% of target
    if (status.daysSinceMovement >= 2 || velocityRatio < 0.6) {
      return 'watching';
    }
    
    // SILENT MODE: execution is happening, gap is closing
    return 'silent';
  }

  /**
   * Generates the precisely timed question when in WATCHING mode.
   */
  static generateWatchingQuestion(status: GapStatus): string {
    const days = Math.floor(status.daysSinceMovement);
    if (days >= 2) {
      return `Your gap hasn't moved in ${days} days. What is the single thing blocking you right now?`;
    } else {
      return `Your velocity dropped ${Math.round((1 - (status.velocity7d / status.targetVelocity)) * 100)}% below target. What is the constraint right now?`;
    }
  }
}
