import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IBrowserKernelManager,
  BrowserKernelManager,
} from '@deathbeds/browserkernels';

import '../style/index.css';

const id = '@deathbeds/browserkernels';

const extension: JupyterLabPlugin<IBrowserKernelManager> = {
  id,
  autoStart: true,
  provides: IBrowserKernelManager,
  activate: (app: JupyterLab) => new BrowserKernelManager(app)
};

export default extension;
