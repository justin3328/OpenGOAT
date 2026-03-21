import type { Gap, Path } from '../types/index.js';
export declare function calculateGap(current: number, target: number, deadline: Date): Gap;
export declare function scorePathBySpeed(path: Path, gap: Gap): number;
export declare function rankPaths(paths: Path[], gap: Gap): Path[];
