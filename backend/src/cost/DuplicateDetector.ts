import { logger } from '../config/logger';

export class DuplicateDetector {
  private knownHashes = new Set<string>();

  checkAndRegister(assetHash: string): { isDuplicate: boolean } {
    if (this.knownHashes.has(assetHash)) {
      logger.info(`[DuplicateDetector] Duplicate asset detected with hash ${assetHash}`);
      return { isDuplicate: true };
    }
    this.knownHashes.add(assetHash);
    return { isDuplicate: false };
  }
}

export const duplicateDetector = new DuplicateDetector();
