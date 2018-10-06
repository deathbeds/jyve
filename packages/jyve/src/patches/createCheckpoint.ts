import { JupyterLab } from '@jupyterlab/application';

import { IJyve } from '..';

export function patchCreateCheckpoint(app: JupyterLab, jyve: IJyve) {
  const mgr = app.serviceManager.contents;
  const _createCheckpoint = mgr.createCheckpoint;

  async function createCheckpoint(path: string) {
    try {
      return await _createCheckpoint.call(mgr, path);
    } catch (err) {
      console.warn('createCheckpoint', err);
      return {};
    }
  }

  app.serviceManager.contents.createCheckpoint = createCheckpoint;
}
