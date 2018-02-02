
import {
  find,
} from '@phosphor/algorithm';

import {
  ServerConnection
} from '@jupyterlab/services';


import {
  Kernel,
} from '@jupyterlab/services/lib/kernel';

import {
  DefaultKernel,
} from '@jupyterlab/services/lib/kernel/default';


export class DefaultBrowserKernel extends DefaultKernel {

}

const runningKernels: DefaultKernel[] = [];


export namespace DefaultBrowserKernel {
  export function connectTo(
    model: Kernel.IModel,
    settings?: ServerConnection.ISettings
  ): Promise<Kernel.IKernel> {
    let serverSettings = settings || ServerConnection.makeSettings();
    let kernel = find(runningKernels, value => {
      return value.id === model.id;
    });
    if (kernel) {
      return Promise.resolve(kernel.clone());
    }

    return Promise.resolve(new DefaultBrowserKernel(
      { name: model.name, serverSettings }, model.id
    ));
  }
}
