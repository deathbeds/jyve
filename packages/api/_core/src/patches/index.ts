import {patchCreateCheckpoint} from './createCheckpoint';
import {patchGetSpecs} from './getSpecs';
import {patchListRunning} from './listRunning';
import {patchNewUntitled} from './newUntitled';
import {patchStartNew} from './startNew';

import {PageConfig} from '@jupyterlab/coreutils';

let _patches = {
  patchCreateCheckpoint,
  patchGetSpecs,
  patchListRunning,
  patchNewUntitled,
  patchStartNew,
};

if (PageConfig.getOption('jyveOffline')) {
  console.log('enabling extra patches');
} else {
  delete _patches['patchNewUntitled'];
}

export const patches = _patches;
