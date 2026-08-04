import { logger } from '../config/logger';

export interface UserConsent {
  userId: string;
  purposes: Record<string, boolean>; // e.g. { marketing: true, analytics: false }
  version: string;
  updatedAt: string;
}

export class ConsentManager {
  private consents = new Map<string, UserConsent>();

  setConsent(userId: string, purposes: Record<string, boolean>, version = '2.1'): UserConsent {
    const consent: UserConsent = {
      userId,
      purposes,
      version,
      updatedAt: new Date().toISOString(),
    };
    this.consents.set(userId, consent);
    logger.info(`[ConsentManager] Updated consent for user ${userId} (version ${version})`);
    return consent;
  }

  getConsent(userId: string): UserConsent | undefined {
    return this.consents.get(userId);
  }

  hasConsent(userId: string, purpose: string): boolean {
    const userConsent = this.consents.get(userId);
    return Boolean(userConsent?.purposes[purpose]);
  }
}

export const consentManager = new ConsentManager();
