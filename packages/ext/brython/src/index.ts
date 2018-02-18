import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';
import {kernelSpec, newKernel} from '@deathbeds/jyve-brython-unsafe';

const id = '@deathbeds/jyve-brython-unsafe-extension';

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (
    app: JupyterLab, jyve: IJyve
  ) => jyve.register({kernelSpec, newKernel})
};

export default extension;
