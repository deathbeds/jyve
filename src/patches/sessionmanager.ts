import {
  JupyterLab,
} from '@jupyterlab/application';

import {
  SessionManager,
} from '@jupyterlab/services';

export function patchSessionManager(app: JupyterLab) {
  const mgr = app.serviceManager.sessions;
  console.log("PATCHING", SessionManager, mgr);
}
