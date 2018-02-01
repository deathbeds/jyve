import {patchSessionManager} from './sessionmanager';
import {patchGetSpecs} from './kernel';

export const patches = {
  patchSessionManager,
  patchGetSpecs,
}
