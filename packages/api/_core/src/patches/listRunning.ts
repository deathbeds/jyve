import {DefaultSession} from '@jupyterlab/services/lib/session/default';
import {ServerConnection} from '@jupyterlab/services';
import {JupyterLab} from '@jupyterlab/application';

import {IJyve} from '..';

export function patchListRunning(
  app: JupyterLab,
  jyve: IJyve
) {
  const {listRunning} = DefaultSession;

  DefaultSession.listRunning = async function(
    settings: ServerConnection.ISettings
  ) {
    const running = await listRunning(settings);
    console.groupCollapsed('could have changed listRunning');
    console.table(running);
    console.log(running);
    console.groupEnd();
    return running;
  };
}
