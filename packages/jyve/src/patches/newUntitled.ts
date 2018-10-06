import { JupyterLab } from '@jupyterlab/application';
import { Contents } from '@jupyterlab/services';

import { IJyve } from '..';

const DEBUG = false;

let nextJyve = 1;

function jyveModel() {
  let model: Contents.IModel = {
    name: `Jyve${nextJyve++}.ipynb`,
    path: `Jyve${nextJyve++}.ipynb`,
    type: 'notebook',
    writable: true,
    created: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    mimetype: 'text/plain',
    content: {
      metadata: {},
      cells: []
    },
    format: 'json'
  };
  return model;
}

export function patchNewUntitled(app: JupyterLab, jyve: IJyve) {
  const mgr = app.serviceManager.contents;

  const _newUntitled = mgr.newUntitled;
  const _get = mgr.get;
  const _save = mgr.save;
  const _listCheckpoints = mgr.listCheckpoints;

  async function get(
    path: string,
    options?: Contents.IFetchOptions
  ): Promise<Contents.IModel> {
    try {
      return await _get.call(mgr, path, options);
    } catch (err) {
      if (DEBUG) {
        console.log('failed naive request', err);
      }
    }

    try {
      let result: Contents.IModel = await _get.call(
        mgr,
        `${path}/index.html`,
        options
      );
      if (DEBUG) {
        console.log('trying with index.html');
      }
      (result as any).path = path;
      return result;
    } catch (err) {
      if (DEBUG) {
        console.log('failed naive request', err);
      }
      return jyveModel();
    }
  }

  async function newUntitled(
    options: Contents.ICreateOptions
  ): Promise<Contents.IModel> {
    if (DEBUG) {
      console.log('newUntitled', options);
    }
    try {
      return await _newUntitled.call(mgr, options);
    } catch (err) {
      return jyveModel();
    }
  }

  async function save(path: string, options?: Partial<Contents.IModel>) {
    if (DEBUG) {
      console.log('save[', path, ']', options);
    }
    try {
      return await _save.call(mgr, options);
    } catch (err) {
      if (DEBUG) {
        console.log(path, options);
      }
      return jyveModel();
    }
  }

  async function listCheckpoints(
    path: string
  ): Promise<Contents.ICheckpointModel[]> {
    if (DEBUG) {
      console.log('listCheckpoints[', path, ']');
    }
    try {
      return await _listCheckpoints.call(mgr, path);
    } catch (err) {
      return [];
    }
  }

  app.serviceManager.contents.newUntitled = newUntitled;
  app.serviceManager.contents.get = get;
  app.serviceManager.contents.save = save;
  app.serviceManager.contents.listCheckpoints = listCheckpoints;
}
