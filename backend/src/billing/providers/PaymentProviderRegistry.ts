import { PaymentProvider } from './PaymentProvider';
import { razorpayProvider } from './RazorpayProvider';
import { logger } from '../../config/logger';

export class PaymentProviderRegistry {
  private providers = new Map<string, PaymentProvider>();

  constructor() {
    this.registerProvider(razorpayProvider);
  }

  registerProvider(provider: PaymentProvider): void {
    this.providers.set(provider.providerName, provider);
    logger.info(`[PaymentProviderRegistry] Registered provider '${provider.providerName}'`);
  }

  getProvider(name = 'razorpay'): PaymentProvider {
    const provider = this.providers.get(name.toLowerCase());
    if (!provider) {
      logger.warn(`[PaymentProviderRegistry] Provider '${name}' not found, falling back to Razorpay`);
      return this.providers.get('razorpay')!;
    }
    return provider;
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}

export const paymentProviderRegistry = new PaymentProviderRegistry();
