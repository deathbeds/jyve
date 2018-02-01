import {
  JupyterLab,
} from '@jupyterlab/application';

import {
  Kernel,
  ServerConnection,
} from '@jupyterlab/services';

export function patchGetSpecs(app: JupyterLab) {
  console.log("GETSPECS", Kernel);
  const _oldSpecs = Kernel.getSpecs;

  function getSpecs(
    settings?: ServerConnection.ISettings
  ): Promise<Kernel.ISpecModels> {
    return _oldSpecs.call(Kernel, settings).then(function () {
      console.log("GET_SPECS", arguments);
    });
  }

  Kernel.getSpecs = function(settings: ServerConnection.ISettings) {
    return getSpecs(settings);
  };
}
