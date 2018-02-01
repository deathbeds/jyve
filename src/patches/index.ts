import {patchSessionManager} from './sessionmanager';
import {patchGetSpecs} from './kernel';
import {patchChangeKernel} from './session';

export const patches = {
  patchSessionManager,
  patchGetSpecs,
  patchChangeKernel,
}
