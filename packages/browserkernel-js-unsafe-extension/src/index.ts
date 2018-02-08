import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IBrowserKernelManager} from '@deathbeds/browserkernels';
import {kernelSpec, newKernel} from '@deathbeds/browserkernel-js-unsafe';

const id = '@deathbeds/browkerkernel-js-unsafe-extension';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IBrowserKernelManager],
  activate: (
    app: JupyterLab, browserKernels: IBrowserKernelManager
  ) => browserKernels.register({kernelSpec, newKernel})
};

export default extension;
