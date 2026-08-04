import { pluginSDK, AIOSPluginManifest } from '../plugins/PluginSDK';
import { providerRegistry } from '../providers/ProviderRegistry';
import { agentRegistryV2 } from '../agents/AgentRegistryV2';
import { dagRunner, DAGGraph } from '../workflow/DAGRunner';
import { AgentContextV2 } from '../agents/BaseAgentV2';

export class StoryForgeSDK {
  readonly version = '3.0.0-AIOS';

  registerProvider(provider: any): void {
    providerRegistry.register(provider);
  }

  registerAgent(agent: any): void {
    agentRegistryV2.register(agent);
  }

  registerPlugin(manifest: AIOSPluginManifest): void {
    pluginSDK.registerPlugin(manifest);
  }

  async runWorkflow(graph: DAGGraph, context: AgentContextV2): Promise<DAGGraph> {
    return dagRunner.executeDAG(graph, context);
  }
}

export const sdk = new StoryForgeSDK();
