import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';
import {kernelSpec, newKernel} from '@deathbeds/jyve-js-unsafe';

const id = '@deathbeds/jyve-js-unsafe-extension';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: (
    app: JupyterLab, jyve: IJyve
  ) => jyve.register({kernelSpec, newKernel})
};

export default extension;
