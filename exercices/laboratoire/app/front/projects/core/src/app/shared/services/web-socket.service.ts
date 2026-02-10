import {io, Socket} from 'socket.io-client';

export type WebSocketMessage = {
  source: string,
  msg: Record<string, any>,
  timestamp: Date
}

export class WebSocketService {
  protected $ws: Socket

  constructor(
    private source: string,
    private connectionString: string,
  ) {
    this.$ws = io(connectionString, {transports: ['websocket']})
    this.$ws.connect()
  }

  on(event: string, cb: (msg: WebSocketMessage) => void) {
    this.$ws.on(`${this.source}.${event}`, (msg: WebSocketMessage) => cb(msg))
  }

  emit(event: string, msg: Record<string, any>) {
    this.$ws.emit(`${this.source}.${event}`, this.messageFactory(msg))
  }

  private messageFactory(msg: Record<string, any>) {
    return ({
      source: this.source,
      msg,
      timestamp: new Date()
    }) as WebSocketMessage
  }

  disconnect() {
    this.$ws.disconnect();
  }
}
