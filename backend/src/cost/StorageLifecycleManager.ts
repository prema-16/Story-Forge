import { logger } from '../config/logger';

export class StorageLifecycleManager {
  determineTier(daysUnaccessed: number): 'hot' | 'warm' | 'cold' | 'archive' {
    if (daysUnaccessed > 365) return 'archive';
    if (daysUnaccessed > 90) return 'cold';
    if (daysUnaccessed > 30) return 'warm';
    return 'hot';
  }
}

export const storageLifecycleManager = new StorageLifecycleManager();
