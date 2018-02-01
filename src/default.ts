// import {
//   DefaultSession,
// } from '@jupyterlab/services/lib/session/default';

import {
  Session,
} from '@jupyterlab/services/lib/session';


export namespace DefaultBrowserSession {
  export
  function startNew(options: Session.IOptions): Promise<Session.ISession> {
    console.log('Start New', options);
    return null;
  }
}
