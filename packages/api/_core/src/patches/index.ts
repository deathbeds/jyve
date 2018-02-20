import {patchGetSpecs} from './getSpecs';
import {patchStartNew} from './startNew';
import {patchListRunning} from './listRunning';
import {patchCreateCheckpoint} from './createCheckpoint';
import {patchNewUntitled} from './newUntitled';

export const patches = {
  patchGetSpecs,
  patchStartNew,
  patchListRunning,
  patchCreateCheckpoint,
  patchNewUntitled,
};
