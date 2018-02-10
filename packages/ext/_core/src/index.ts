import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import * as core from '@deathbeds/jyve';

import '../style/index.css';

const id = '@deathbeds/jyve';

const extension: JupyterLabPlugin<core.IJyve> = {
  id,
  autoStart: true,
  provides: core.IJyve,
  activate: (app: JupyterLab) => new core.Jyve(app)
};

export default extension;
