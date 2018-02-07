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
  activate: (app: JupyterLab) => {
    console.log(`[${id}] activating...`);
    const manager = new BrowserKernelManager(app);
    manager.ready.then(() => {
      console.log(`[${id}] ready!`);
    });
    console.log(`[${id}] activated...`);
    return manager;
  }
};

export default extension;
