import { providerRegistry } from '../providers/ProviderRegistry';
import { agentRegistryV2 } from '../agents/AgentRegistryV2';
import { IAIProvider } from '../providers/interfaces';
import { BaseAgentV2 } from '../agents/BaseAgentV2';
import { logger } from '../../config/logger';

export interface AIOSPluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  providers?: IAIProvider[];
  agents?: BaseAgentV2[];
}

export class PluginSDK {
  private plugins = new Map<string, AIOSPluginManifest>();

  /**
   * Register a third-party AIOS plugin.
   */
  registerPlugin(manifest: AIOSPluginManifest): void {
    if (this.plugins.has(manifest.id)) {
      throw new Error(`Plugin '${manifest.id}' is already registered.`);
    }

    if (manifest.providers) {
      manifest.providers.forEach((p) => providerRegistry.register(p));
    }

    if (manifest.agents) {
      manifest.agents.forEach((a) => agentRegistryV2.register(a));
    }

    this.plugins.set(manifest.id, manifest);
    logger.info(`[PluginSDK] Installed plugin '${manifest.name}' v${manifest.version} by ${manifest.author}`);
  }

  listPlugins(): AIOSPluginManifest[] {
    return Array.from(this.plugins.values());
  }
}

export const pluginSDK = new PluginSDK();
