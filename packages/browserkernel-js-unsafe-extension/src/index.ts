import {JupyterLab, JupyterLabPlugin} from '@jupyterlab/application';
import {IBrowserKernelManager} from '@deathbeds/browserkernels';
import {kernelSpec, newKernel} from '@deathbeds/browserkernel-js-unsafe';

const id = '@deathbeds/browkerkernel-js-unsafe-extension';

const extension: JupyterLabPlugin<void> = {
  id,
  autoStart: true,
  requires: [IBrowserKernelManager],
  activate: async (app: JupyterLab, browserKernels: IBrowserKernelManager) => {
    console.log(`[${id}] activating...`);
    await browserKernels.register({
      kernelSpec,
      newKernel,
    });
    console.log(`...[${id}] activated!`);
  }
};

export default extension;
