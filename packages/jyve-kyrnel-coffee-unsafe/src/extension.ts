import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';
import '../style/index.css';

// tslint:disable-next-line
const pkg = require('../package.json') as any;

const id = pkg.name;

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (app: JupyterLab, jyve: IJyve) => {
    jyve.register({
      kernelSpec: pkg.jyve.kernelspec,
      newKernel: import('.') as any,
    });
  },
};

export default extension;
