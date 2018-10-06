import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';
const id = '@deathbeds/jyve-lyb-phosphor';

import * as algorithm from '@phosphor/algorithm';
import * as application from '@phosphor/application';
import * as collections from '@phosphor/collections';
import * as commands from '@phosphor/commands';
import * as coreutils from '@phosphor/coreutils';
import * as disposable from '@phosphor/disposable';
import * as domutils from '@phosphor/domutils';
import * as dragdrop from '@phosphor/dragdrop';
import * as keyboard from '@phosphor/keyboard';
import * as messaging from '@phosphor/messaging';
import * as properties from '@phosphor/properties';
import * as signaling from '@phosphor/signaling';
import * as virtualdom from '@phosphor/virtualdom';
import * as widgets from '@phosphor/widgets';

import '../style/index.css';

/* tslint:disable */
const CSS = [
  require('!!raw-loader!@phosphor/dragdrop/style/index.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/widget.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/commandpalette.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/dockpanel.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/menu.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/menubar.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/scrollbar.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/splitpanel.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/tabbar.css') as any,
  require('!!raw-loader!@phosphor/widgets/style/tabpanel.css') as any,
];
/* tslint:enable */

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (app: JupyterLab, jyve: IJyve) => {
    jyve.lyb('phosphor', async function(ns: any) {
      ns['phosphor'] = {
        algorithm,
        application,
        collections,
        commands,
        coreutils,
        disposable,
        domutils,
        dragdrop,
        keyboard,
        messaging,
        properties,
        signaling,
        virtualdom,
        widgets,
        CSS,
      };
    });
  },
};

export default extension;
