import * as dbk from './default';
import * as k from '@jupyterlab/services/lib/kernel';
import * as S from '@jupyterlab/services';


export namespace BrowserKernel {
  export function connectTo(
    model: k.Kernel.IModel,
    settings?: S.ServerConnection.ISettings
  ): Promise<k.Kernel.IKernel> {
    return dbk.DefaultBrowserKernel.connectTo(model, settings);
  }
}
