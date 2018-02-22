import {DefaultSession} from '@jupyterlab/services/lib/session/default';
import {Session, Kernel, ServerConnection} from '@jupyterlab/services';

import {uuid} from '@jupyterlab/coreutils';


import {JyveKernel} from './kernel';
import {JyveSocket, JyveServer} from './socket';
import {Jyve} from '.';

const DEBUG = false;

export class JyveSession extends DefaultSession {
  dispose(force=false) {
    if (DEBUG) {
      console.log('disposing', force, this);
    }
    if (force) {
      super.dispose();
    }
  }
}

export
namespace JyveSession {
  /**
   * Start a new session.
   */
  export async function startNew(
    options: Jyve.ISessionOptions
  ): Promise<Session.ISession> {
    const kernelId = uuid();
    const sessionId = uuid();

    const serverSettings = {
      ...options.serverSettings || ServerConnection.makeSettings(),
      WebSocket: JyveSocket as any
    };

    const kernelModel: Kernel.IModel = {
      id: kernelId,
      name: options.name
    };

    const kernelURL = JyveKernel.kernelURL(
      kernelId, sessionId, serverSettings);

    const model: Session.IModel = {
      path: options.path,
      type: options.type,
      name: options.name,
      id: sessionId,
      kernel: kernelModel
    };

    const kernelOptions: JyveKernel.IOptions = {
      name: options.kernelName,
      clientId: sessionId,
      server: new JyveServer(kernelURL),
      serverSettings
    };

    const kernel = await options.manager.makeKernel(kernelOptions, kernelId);

    return new JyveSession({
      path: model.path,
      type: model.type,
      name: model.name,
      serverSettings: serverSettings,
    }, model.id, kernel);
  }
}
