import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'api/workflow',
  cors: { origin: '*' }, // TODO: Restrict this in production
  transports: ['websocket'],
})
export class WorkflowGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  private readonly source = 'waves.front.workflow';

  constructor() {
    Logger.log(
      'Workflow Gateway initialized -- constructor',
      WorkflowGateway.name,
    );
  }

  afterInit(server: any) {
    Logger.log(
      'Workflow Gateway initialized -- afterInit',
      WorkflowGateway.name,
    );
  }

  /* afterInit(server: Server) {
    Logger.log('Workflow Gateway initialized', WorkflowGateway.name);
  } */

  handleConnection(client: Socket) {
    Logger.log(`Client connected: ${client.id}`, WorkflowGateway.name);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`, WorkflowGateway.name);
  }

  private emit(event: string, msg: any) {
    console.log('emit() called', event, msg);

    this.server.emit(`${this.source}.${event}`, {
      source: this.source,
      msg,
      timestamp: new Date(),
    });
  }

  newEmit(workflow: any) {
    console.log('Emitting new workflow event');
    this.emit('new', workflow);
  }

  startEmit(workflow: any) {
    console.log('Emitting start workflow event');
    this.emit('start', workflow);
  }

  updateEmit(workflow: any) {
    console.log('Emitting update workflow event');
    this.emit('update', workflow);
  }

  stopEmit(workflow: any) {
    console.log('Emitting stop workflow event');
    this.emit('stop', workflow);
  }

  playEmit(workflow: any) {
    console.log('Emitting play workflow event');
    this.emit('play', workflow);
  }
}
