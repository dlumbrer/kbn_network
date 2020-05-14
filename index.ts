import { resolve } from 'path';
import { Legacy } from 'kibana';

import { LegacyPluginApi, LegacyPluginInitializer } from '../../src/legacy/types';

const networkVisPluginInitializer: LegacyPluginInitializer = ({ Plugin }: LegacyPluginApi) =>
  new Plugin({
    id: 'network_vis',
    require: ['kibana', 'elasticsearch', 'interpreter'],
    publicDir: resolve(__dirname, 'public'),
    uiExports: {
      hacks: [resolve(__dirname, 'public/legacy')],
      injectDefaultVars: server => ({}),
    }
  } as Legacy.PluginSpecOptions);

export default networkVisPluginInitializer;
