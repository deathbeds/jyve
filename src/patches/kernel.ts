import {
  JupyterLab,
} from '@jupyterlab/application';

import {
  Kernel,
  ServerConnection,
} from '@jupyterlab/services';

import {KERNELS} from '../kernels';

export function patchGetSpecs(app: JupyterLab) {
  const _oldSpecs = Kernel.getSpecs;

  async function getSpecs(
    settings?: ServerConnection.ISettings
  ): Promise<Kernel.ISpecModels> {
    console.log('app', app);
    const specs: Kernel.ISpecModels = await _oldSpecs.call(Kernel, settings);
    console.log('specs', specs);
    const newSpecs = {
      default: `${specs.default}`,
      kernelspecs: {
        ...KERNELS.kernelspecs,
        ...specs.kernelspecs
      }
    };
    console.log(newSpecs);
    return newSpecs;
  }

  Kernel.getSpecs = function(settings: ServerConnection.ISettings) {
    return getSpecs(settings);
  };

  app.serviceManager.sessions.specsChanged.connect((mgr, model) => {
    console.log("specschanged fired", mgr, model);
  });

  app.serviceManager.sessions.refreshSpecs();
}
