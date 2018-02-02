// import {
//   DefaultSession,
// } from '@jupyterlab/services/lib/session/default';

import {
  Session,
} from '@jupyterlab/services/lib/session';


import {
  ServerConnection
} from '@jupyterlab/services';

import {
  DefaultSession,
} from '@jupyterlab/services/lib/session/default';

import {
  BrowserKernel,
} from '../kernel';

export
class DefaultBrowserSession extends DefaultSession {
  setPath(path: string): Promise<void> {
    if (this.isDisposed) {
      return Promise.reject(new Error('Session is disposed'));
    }
    return Promise.resolve(void 0);
  }


  setName(name: string): Promise<void> {
    if (this.isDisposed) {
      return Promise.reject(new Error('Session is disposed'));
    }
    return Promise.resolve(void 0);
  }

  setType(type: string): Promise<void> {
    if (this.isDisposed) {
      return Promise.reject(new Error('Session is disposed'));
    }
    return Promise.resolve(void 0);
  }
}

export namespace DefaultBrowserSession {
  export
  async function startNew(options: Session.IOptions): Promise<Session.ISession> {
    if (options.path === void 0) {
      return Promise.reject(new Error('Must specify a path'));
    }
    const model = await startSession(options);
    const session = await createSession(model, options.serverSettings);
    return session;
  }

  /**
   * Create a Session object.
   *
   * @returns - A promise that resolves with a started session.
   */
  export
  function createSession(model: Session.IModel, settings?: ServerConnection.ISettings): Promise<DefaultSession> {
    return BrowserKernel.connectTo(model.kernel, settings).then(kernel => {
      return new DefaultBrowserSession({
        path: model.path,
        type: model.type,
        name: model.name,
        serverSettings: settings
      }, model.id, kernel);
    });
  }

  /**
   * Create a new session, or return an existing session if a session if
   * the session path already exists
   */
  export
  async function startSession(options: Session.IOptions): Promise<Session.IModel> {

    return model;
  }
}
