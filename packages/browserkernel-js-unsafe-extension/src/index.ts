import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  IBrowserKernelManager,
} from 'browserkernels';

import {
  kernelSpec,
} from 'browserkernel-js-unsafe';


const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_browserkernels',
  autoStart: true,
  requires: [IBrowserKernelManager],
  activate: (app: JupyterLab, browserKernels) => {
    browserKernels.register('unsafe', {
      spec: kernelSpec
    });
  }
};

export default extension;
