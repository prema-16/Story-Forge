import { logger } from '../config/logger';

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  permissions: string[]; // ['storage:read', 'timeline:write']
  signatureValid: boolean;
  status: 'installed' | 'active' | 'disabled';
}

export class PluginSDKManager {
  private plugins = new Map<string, PluginManifest>();

  constructor() {
    this.installPlugin({
      id: 'plugin_auto_caption_ai',
      name: 'Auto-Caption AI Pro',
      version: '2.1.0',
      author: 'StoryForge Labs',
      permissions: ['timeline:read', 'subtitles:write'],
      signatureValid: true,
      status: 'active',
    });

    this.installPlugin({
      id: 'plugin_color_grade_vfx',
      name: 'ColorGrade FX Suite',
      version: '1.4.2',
      author: 'VFX Master Tools',
      permissions: ['canvas:render'],
      signatureValid: true,
      status: 'active',
    });
  }

  installPlugin(manifest: PluginManifest): void {
    if (!manifest.signatureValid) {
      throw new Error(`Plugin '${manifest.name}' failed security digital signature verification.`);
    }
    this.plugins.set(manifest.id, manifest);
    logger.info(`[PluginSDKManager] Installed verified plugin '${manifest.name}' v${manifest.version}`);
  }

  listPlugins(): PluginManifest[] {
    return Array.from(this.plugins.values());
  }

  getPluginById(pluginId: string): PluginManifest | undefined {
    return this.plugins.get(pluginId);
  }

  setPluginStatus(pluginId: string, status: 'installed' | 'active' | 'disabled'): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return false;

    plugin.status = status;
    logger.info(`[PluginSDKManager] Plugin '${plugin.name}' status updated to '${status}'`);
    return true;
  }

  checkPermission(pluginId: string, permission: string): boolean {
    const plugin = this.plugins.get(pluginId);
    if (!plugin || plugin.status !== 'active') return false;
    return plugin.permissions.includes(permission);
  }

  uninstallPlugin(pluginId: string): boolean {
    const deleted = this.plugins.delete(pluginId);
    if (deleted) {
      logger.info(`[PluginSDKManager] Uninstalled plugin '${pluginId}'`);
    }
    return deleted;
  }
}

export const pluginSDKManager = new PluginSDKManager();

