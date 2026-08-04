import { logger } from '../config/logger';

export interface SBOMComponent {
  name: string;
  version: string;
  type: 'library' | 'framework' | 'container' | 'operating-system';
  purl: string;
  licenses: string[];
  supplier?: string;
}

export interface SBOMDocument {
  bomFormat: 'CycloneDX';
  specVersion: '1.5';
  serialNumber: string;
  version: number;
  metadata: {
    timestamp: string;
    component: { name: string; version: string; type: string };
  };
  components: SBOMComponent[];
}

export class SBOMGenerator {
  private knownComponents: SBOMComponent[] = [
    { name: 'express', version: '4.21.2', type: 'framework', purl: 'pkg:npm/express@4.21.2', licenses: ['MIT'], supplier: 'OpenJS Foundation' },
    { name: 'mongoose', version: '8.9.3', type: 'library', purl: 'pkg:npm/mongoose@8.9.3', licenses: ['MIT'], supplier: 'MongoDB' },
    { name: 'ioredis', version: '5.4.1', type: 'library', purl: 'pkg:npm/ioredis@5.4.1', licenses: ['MIT'], supplier: 'Redis' },
    { name: 'bullmq', version: '5.10.0', type: 'library', purl: 'pkg:npm/bullmq@5.10.0', licenses: ['MIT'], supplier: 'Taskforce' },
    { name: 'jsonwebtoken', version: '9.0.2', type: 'library', purl: 'pkg:npm/jsonwebtoken@9.0.2', licenses: ['MIT'] },
    { name: 'helmet', version: '8.0.0', type: 'library', purl: 'pkg:npm/helmet@8.0.0', licenses: ['MIT'] },
    { name: 'zod', version: '3.24.1', type: 'library', purl: 'pkg:npm/zod@3.24.1', licenses: ['MIT'] },
    { name: '@anthropic-ai/sdk', version: '0.39.0', type: 'library', purl: 'pkg:npm/@anthropic-ai/sdk@0.39.0', licenses: ['MIT'], supplier: 'Anthropic' },
    { name: '@google/generative-ai', version: '0.21.0', type: 'library', purl: 'pkg:npm/@google/generative-ai@0.21.0', licenses: ['Apache-2.0'], supplier: 'Google' },
    { name: 'openai', version: '4.77.0', type: 'library', purl: 'pkg:npm/openai@4.77.0', licenses: ['MIT'], supplier: 'OpenAI' },
    { name: 'stripe', version: '22.3.2', type: 'library', purl: 'pkg:npm/stripe@22.3.2', licenses: ['MIT'], supplier: 'Stripe' },
    { name: 'cloudinary', version: '2.5.1', type: 'library', purl: 'pkg:npm/cloudinary@2.5.1', licenses: ['MIT'], supplier: 'Cloudinary' },
    { name: 'node', version: '22.22.3', type: 'operating-system', purl: 'pkg:generic/node@22.22.3', licenses: ['MIT'], supplier: 'OpenJS Foundation' },
  ];

  generate(appName = 'storyforge-backend', appVersion = '3.0.0'): SBOMDocument {
    const doc: SBOMDocument = {
      bomFormat: 'CycloneDX',
      specVersion: '1.5',
      serialNumber: `urn:uuid:${this.generateUUID()}`,
      version: 1,
      metadata: {
        timestamp: new Date().toISOString(),
        component: { name: appName, version: appVersion, type: 'application' },
      },
      components: this.knownComponents,
    };

    logger.info(`[SBOMGenerator] Generated CycloneDX SBOM v1.5 for ${appName}@${appVersion} with ${doc.components.length} components`);
    return doc;
  }

  getLicenseSummary(): Record<string, number> {
    const licenses: Record<string, number> = {};
    for (const comp of this.knownComponents) {
      for (const lic of comp.licenses) {
        licenses[lic] = (licenses[lic] || 0) + 1;
      }
    }
    return licenses;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }
}

export const sbomGenerator = new SBOMGenerator();
