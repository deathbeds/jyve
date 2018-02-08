import {DefaultSession} from '@jupyterlab/services/lib/session/default';
import {Session, Kernel, ServerConnection} from '@jupyterlab/services';

import {uuid} from '@jupyterlab/coreutils';


import {BrowserKernel} from './kernel';
import {BrowserKernelSocket, BrowserSocketServer} from './socket';
import {BrowserKernelManager} from '.';


export class BrowserSession extends DefaultSession {}

export
namespace BrowserSession {
  /**
   * Start a new session.
   */
  export async function startNew(
    options: BrowserKernelManager.ISessionOptions
  ): Promise<Session.ISession> {
    const kernelId = uuid();
    const sessionId = uuid();

    const serverSettings = {
      ...options.serverSettings || ServerConnection.makeSettings(),
      WebSocket: BrowserKernelSocket as any
    };

    const kernelModel: Kernel.IModel = {
      id: kernelId,
      name: options.name
    };

    const kernelURL = BrowserKernel.kernelURL(
      kernelId, sessionId, serverSettings);

    const model: Session.IModel = {
      path: options.path,
      type: options.type,
      name: options.name,
      id: sessionId,
      kernel: kernelModel
    };

    const kernelOptions: BrowserKernel.IOptions = {
      name: options.kernelName,
      clientId: sessionId,
      server: new BrowserSocketServer(kernelURL),
      serverSettings
    };

    // const kernel = new BrowserKernel(kernelOptions, kernelModel.id);
    const kernel = options.manager.makeKernel(kernelOptions, kernelId);

    return new DefaultSession({
      path: model.path,
      type: model.type,
      name: model.name,
      serverSettings: serverSettings,
    }, model.id, kernel);
  }
}
