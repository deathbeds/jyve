import { JupyterLab } from '@jupyterlab/application';
import { Session } from '@jupyterlab/services/lib/session';

import { IJyve } from '..';

export function patchStartNew(app: JupyterLab, jyve: IJyve) {
  const { sessions } = app.serviceManager;
  const { startNew } = sessions;

  sessions.startNew = function(
    options: Session.IOptions
  ): Promise<Session.ISession> {
    if (jyve.specs.kernelspecs[options.kernelName]) {
      return jyve.startNew(options);
    } else {
      return startNew.call(sessions, options);
    }
  };
}
