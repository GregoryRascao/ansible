import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/workflow', {
  transports: ['websocket'], // Force WebSocket
});

socket.on('waves.front.workflow.new', (msg) => {
  console.log('Received NEW workflow:', msg);
});

socket.on('waves.front.workflow.start', (msg) => {
  console.log('Received START workflow:', msg);
});

socket.on('waves.front.workflow.stop', (msg) => {
  console.log('Received STOP workflow:', msg);
});

socket.on('waves.front.workflow.update', (msg) => {
  console.log('Received UPDATE workflow:', msg);
});

socket.on('connect', () => {
  console.log('Connected to server', socket.id);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected from server', reason);
});
