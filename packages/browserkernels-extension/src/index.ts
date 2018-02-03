import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IBrowserKernelManager,
  BrowserKernelManager,
} from 'browserkernels';

import '../style/index.css';



const extension: JupyterLabPlugin<IBrowserKernelManager> = {
  id: 'jupyterlab_browserkernels',
  autoStart: true,
  activate: (app: JupyterLab) => {
    const manager = new BrowserKernelManager(app);
    return manager;
  }
};

export default extension;
