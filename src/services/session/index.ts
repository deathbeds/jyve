import {
  Session,
} from '@jupyterlab/services/lib/session';

import {
  DefaultBrowserSession,
} from './default';


export namespace BrowserSession {
  export function startNew(options: Session.IOptions) {
    return DefaultBrowserSession.startNew(options);
  }
}
