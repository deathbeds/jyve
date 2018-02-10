import {patchGetSpecs} from './getSpecs';
import {patchStartNew} from './startNew';
import {patchRestartKernel} from './restartKernel';
import {patchDispose} from './dispose';
import {patchListRunning} from './listRunning';

export const patches = {
  patchGetSpecs,
  patchStartNew,
  patchRestartKernel,
  patchDispose,
  patchListRunning,
};
