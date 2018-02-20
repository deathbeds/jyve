import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IJyve} from '@deathbeds/jyve';

const id = '@deathbeds/jyve-coffee-unsafe-extension';

import '../style/index.css';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IJyve],
  activate: async (
    app: JupyterLab, jyve: IJyve
  ) => {
    const jyveKernel: any = await import('@deathbeds/jyve-coffee-unsafe');

    jyve.register({
      kernelSpec: jyveKernel.kernelSpec,
      newKernel: jyveKernel.newKernel
    });
  }
};

export default extension;
