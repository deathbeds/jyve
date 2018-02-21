import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';
const pkg = (require('../package.json') as any);

const id = '@deathbeds/jyve-brython-unsafe-extension';

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (
    app: JupyterLab, jyve: IJyve
  ) => {
    jyve.register({
      kernelSpec: pkg.jyve.kernelspec,
      newKernel: import('@deathbeds/jyve-brython-unsafe') as any
    });
  }
};

export default extension;
