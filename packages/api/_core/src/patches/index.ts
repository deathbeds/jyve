import {patchGetSpecs} from './getSpecs';
import {patchStartNew} from './startNew';
import {patchListRunning} from './listRunning';
import {patchCreateCheckpoint} from './createCheckpoint';
import {patchNewUntitled} from './newUntitled';

import {PageConfig} from '@jupyterlab/coreutils';

let _patches = {
  patchGetSpecs,
  patchStartNew,
  patchListRunning,
  patchCreateCheckpoint,
  patchNewUntitled,
};


if (PageConfig.getOption('jyveOffline')) {
  console.log('enabling extra patches');
} else {
  delete _patches['patchNewUntitled'];
}

export const patches = _patches;
