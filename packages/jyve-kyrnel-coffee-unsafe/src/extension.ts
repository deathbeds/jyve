import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { IJyve } from '@deathbeds/jyve';
const id = '@deathbeds/jyve-kyrnel-coffee-unsafe';

// tslint:disable-next-line
const pkg = require('../package.json') as any;

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (app: JupyterLab, jyve: IJyve) => {
    jyve.register({
      kernelSpec: pkg.jyve.kernelspec,
      newKernel: import('.') as any
    });
  }
};

export default extension;
