import {JSONExt} from '@phosphor/coreutils';

import {JupyterLab} from '@jupyterlab/application';
import {Kernel} from '@jupyterlab/services/lib/kernel';


import {IBrowserKernelManager} from '..';


export function patchGetSpecs(
  app: JupyterLab,
  browserKernels: IBrowserKernelManager
) {
  /* tslint:disable */
  (app.serviceManager.sessions as any)._refreshSpecs = function() {
    return Kernel.getSpecs(this.serverSettings).then(specs => {
      const newSpecs = {
        default: specs.default,
        kernelspecs: {
          ...specs.kernelspecs,
          ...browserKernels.specs.kernelspecs
        }
      };
      if (!JSONExt.deepEqual(newSpecs, this._specs)) {
        this._specs = newSpecs;
        this._specsChanged.emit(newSpecs);
      }
    });
  }
  /* tslint:enable */
}
