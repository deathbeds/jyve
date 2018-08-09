import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import { MainAreaWidget } from '@jupyterlab/apputils';

import * as core from '.';
import {JyvePanel} from './frame';

import '../style/index.css';

const id = '@deathbeds/jyve';

let nextFrameId = 0;

const extension: JupyterLabPlugin<core.IJyve> = {
  id,
  autoStart: true,
  provides: core.IJyve,
  activate: (app: JupyterLab) => {
    const manager = new core.Jyve(app);

    manager.frameRequested.connect((manager, opts) => {
      const panel = new JyvePanel();
      panel.kernel = opts.kernel;
      panel.id = `jyv-frame-${++nextFrameId}`;
      panel.title.label = opts.path
        ? opts.path.split('/').slice(-1)[0]
        : opts.kernel.info.implementation;

      let main = new MainAreaWidget({content: panel});

      app.shell.addToMainArea(main, {mode: 'split-right'});
    });

    return manager;
  },
};

export default extension;
