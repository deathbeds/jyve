import {JupyterLab} from '@jupyterlab/application';
import {ServerConnection} from '@jupyterlab/services';
import {Kernel} from '@jupyterlab/services/lib/kernel';

import {IBrowserKernelManager} from '..';


export function patchGetSpecs(
  app: JupyterLab,
  browserKernels: IBrowserKernelManager
) {
  console.log('patching', Kernel);
  const _oldSpecs = Kernel.getSpecs;

  async function getSpecs(
    settings?: ServerConnection.ISettings
  ): Promise<Kernel.ISpecModels> {
    console.group('ACTUALLY CALLING GETSPECS');
    const specs = await _oldSpecs.call(Kernel, settings);
    console.log('specs', specs.kernelspecs);
    const newSpecs = {
      default: `${specs.default}`,
      kernelspecs: {
        ...specs.kernelspecs,
        ...browserKernels.specs.kernelspecs
      }
    };
    console.log('new specs', newSpecs.kernelspecs);
    console.groupEnd();
    return newSpecs;
  }

  Kernel.getSpecs = async function(settings: ServerConnection.ISettings) {
    console.log('[patched] getSpecs');
    return await getSpecs(settings);
  };

  app.serviceManager.sessions.specsChanged.connect((mgr, model) => {
    console.log('specschanged fired', mgr, Object.keys(model.kernelspecs));
  });
  console.log('patched Kernel', Kernel);
}
