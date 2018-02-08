import {patchGetSpecs} from './getSpecs';
import {patchStartNew} from './startNew';
import {patchRestartKernel} from './restartKernel';

export const patches = {
  patchGetSpecs,
  patchStartNew,
  patchRestartKernel,
};
