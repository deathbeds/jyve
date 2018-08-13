import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';

// tslint:disable-next-line
const pkg = require('../package.json') as any;

const id = pkg.name;

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (app: JupyterLab, jyve: IJyve) => {
    jyve.register({
      kernelSpec: pkg.jyve.kernelspec,
      // tslint:disable-next-line
      newKernel: import('.') as any,
    });
  },
};

export default extension;
