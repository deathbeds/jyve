import { JSONExt } from '@phosphor/coreutils';

import { JupyterLab } from '@jupyterlab/application';
import { Kernel } from '@jupyterlab/services/lib/kernel';

import { IJyve } from '..';

export function patchGetSpecs(app: JupyterLab, jyve: IJyve) {
  /* tslint:disable */
  (app.serviceManager.sessions as any)._refreshSpecs = function() {
    return Kernel.getSpecs(this.serverSettings).then((specs) => {
      const newSpecs = {
        default: specs.default,
        kernelspecs: {
          ...specs.kernelspecs,
          ...jyve.specs.kernelspecs,
        },
      };
      if (!JSONExt.deepEqual(newSpecs, this._specs)) {
        this._specs = newSpecs;
        this._specsChanged.emit(newSpecs);
      }
    });
  };
  /* tslint:enable */
}
