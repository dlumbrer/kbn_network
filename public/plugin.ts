import { PluginInitializerContext, CoreSetup, CoreStart, Plugin } from '../../../../core/public';
import { VisualizationsSetup } from '../../../src/legacy/core_plugins/visualizations/public';
import { networkVisTypeDefinition } from './network_vis';

/** @internal */
export interface NetworkVisPluginSetupDependencies {
  visualizations: VisualizationsSetup;
}

/** @internal */
export class NetworkVisPlugin implements Plugin<void, void> {
  initializerContext: PluginInitializerContext;

  constructor(initializerContext: PluginInitializerContext) {
    this.initializerContext = initializerContext;
  }

  public setup(core: CoreSetup, { visualizations }: NetworkVisPluginSetupDependencies) {
    visualizations.types.createBaseVisualization(networkVisTypeDefinition);
  }

  public start(core: CoreStart) {
    // nothing to do here yet
  }
}
