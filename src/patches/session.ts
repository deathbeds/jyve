import {
  JupyterLab,
} from '@jupyterlab/application';

import {
  DefaultSession,
} from '@jupyterlab/services/lib/session/default';


export function patchChangeKernel(app: JupyterLab) {
  console.log(DefaultSession.prototype.changeKernel);
}
