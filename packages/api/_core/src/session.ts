import {DefaultSession} from '@jupyterlab/services/lib/session/default';
import {Session, Kernel, ServerConnection} from '@jupyterlab/services';

import {uuid} from '@jupyterlab/coreutils';


import {jyve} from './kernel';
import {jyveocket, JyveServerServer} from './socket';
import {Jyve} from '.';


export class JyveSession extends DefaultSession {}

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
      WebSocket: jyveocket as any
    };

    const kernelModel: Kernel.IModel = {
      id: kernelId,
      name: options.name
    };

    const kernelURL = jyve.kernelURL(
      kernelId, sessionId, serverSettings);

    const model: Session.IModel = {
      path: options.path,
      type: options.type,
      name: options.name,
      id: sessionId,
      kernel: kernelModel
    };

    const kernelOptions: jyve.IOptions = {
      name: options.kernelName,
      clientId: sessionId,
      server: new JyveServerServer(kernelURL),
      serverSettings
    };

    // const kernel = new jyve(kernelOptions, kernelModel.id);
    const kernel = options.manager.makeKernel(kernelOptions, kernelId);

    return new DefaultSession({
      path: model.path,
      type: model.type,
      name: model.name,
      serverSettings: serverSettings,
    }, model.id, kernel);
  }
}
