import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {patches} from './patches';

import '../style/index.css';

console.log('🎩 loaded!');

const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_browserkernels',
  autoStart: true,
  activate: (app: JupyterLab) => {
    console.log('🎩 patching!');
    patches.patchGetSpecs(app);
    patches.patchSessionManager(app);
    patches.patchChangeKernel(app);
    console.log('🎩 activated!');
  }
};

export default extension;
