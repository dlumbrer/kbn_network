import { PluginInitializerContext } from '../../../src/core/public';
import { NetworkVisPlugin as Plugin } from './plugin';

export function plugin(initializerContext: PluginInitializerContext) {
  return new Plugin(initializerContext);
}
