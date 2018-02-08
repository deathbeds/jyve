import {JupyterLab} from '@jupyterlab/application';
import {Session} from '@jupyterlab/services/lib/session';


import {IBrowserKernelManager} from '..';


export function patchStartNew(
  app: JupyterLab,
  browserKernels: IBrowserKernelManager
) {
  const {sessions} = app.serviceManager;
  const {startNew} = sessions;

  sessions.startNew = function(
    options: Session.IOptions
  ): Promise<Session.ISession> {
    if (browserKernels.specs.kernelspecs[options.kernelName]) {
      return browserKernels.startNew(options);
    } else {
      return startNew.call(sessions, options);
    }
  };
}
