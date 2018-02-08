import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IJyve,
  Jyve,
} from '@deathbeds/jyve';

import '../style/index.css';

const id = '@deathbeds/jyve';

const extension: JupyterLabPlugin<IJyve> = {
  id,
  autoStart: true,
  provides: IJyve,
  activate: (app: JupyterLab) => new Jyve(app)
};

export default extension;
