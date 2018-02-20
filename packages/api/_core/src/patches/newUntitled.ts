import {JupyterLab} from '@jupyterlab/application';
import {Contents} from '@jupyterlab/services';


import {IJyve} from '..';


export function patchNewUntitled(
  app: JupyterLab,
  jyve: IJyve
) {
  const mgr = app.serviceManager.contents;

  const _newUntitled = mgr.newUntitled;

  async function newUntitled(
    options: Contents.ICreateOptions
  ) {
    try {
      return await _newUntitled.call(mgr, options);
    } catch (err) {
      console.warn('newUntitled', err);
      return {};
    }
  }
  app.serviceManager.contents.newUntitled = newUntitled;
}
