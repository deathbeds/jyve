import {DefaultKernel} from '@jupyterlab/services/lib/kernel/default';
import {JupyterLab} from '@jupyterlab/application';

import {IJyve} from '..';

export function patchRestartKernel(
  app: JupyterLab,
  jyve: IJyve
) {
  const {restart} = DefaultKernel.prototype;
  console.groupCollapsed('TODO: restart');
  console.log('gotta patch restart', restart);
  console.groupEnd();
}
