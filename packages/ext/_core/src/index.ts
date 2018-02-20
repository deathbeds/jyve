import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';

import * as core from '@deathbeds/jyve';
import {JyvePanel} from '@deathbeds/jyve/lib/frame';

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
      panel.title.label = opts.kernel.info.implementation;
      setTimeout(() => app.shell.addToMainArea(panel));
    });

    return manager;
  }
};

export default extension;
