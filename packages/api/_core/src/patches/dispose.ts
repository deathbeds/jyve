import {DefaultSession} from '@jupyterlab/services/lib/session/default';
import {JupyterLab} from '@jupyterlab/application';

import {IJyve} from '..';

export function patchDispose(
  app: JupyterLab,
  jyve: IJyve
) {
  const {dispose} = DefaultSession.prototype;
  console.log('DISPOSE', dispose);
}
