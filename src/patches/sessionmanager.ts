import {
  JupyterLab,
} from '@jupyterlab/application';

import {
  // SessionManager,
  Session,
} from '@jupyterlab/services';

import {
  BrowserSession,
} from '../session';

import {
  KERNELS,
} from '../kernels';

export function patchSessionManager(app: JupyterLab) {
  const mgr = app.serviceManager.sessions;
  const _oldStartNew = mgr.startNew;

  async function startNew(options: Session.IOptions) {

    const spec = KERNELS.kernelspecs[options.kernelName];

    if(spec == null){
      return await _oldStartNew.call(mgr, options);
    }

    let serverSettings = this.serverSettings;

    const session = await BrowserSession.startNew({...options, serverSettings});

    this._onStarted(session);

    return session;
  }

  mgr.startNew = startNew;
}
