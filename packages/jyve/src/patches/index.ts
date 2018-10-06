import { patchCreateCheckpoint } from './createCheckpoint';
import { patchGetSpecs } from './getSpecs';
import { patchNewUntitled } from './newUntitled';
import { patchStartNew } from './startNew';

import { PageConfig } from '@jupyterlab/coreutils';

let _patches = {
  patchCreateCheckpoint,
  patchGetSpecs,
  patchNewUntitled,
  patchStartNew
};

if (PageConfig.getOption('jyveOffline')) {
  console.warn('enabling extra patches');
} else {
  delete _patches['patchNewUntitled'];
}

export const patches = _patches;
