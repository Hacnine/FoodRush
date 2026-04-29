import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: 'delivery',
})
export class DeliveryGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(DeliveryGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('trackOrder')
  handleTrackOrder(@MessageBody() data: { orderId: string }, @ConnectedSocket() client: Socket) {
    client.join(`order:${data.orderId}`);
    this.logger.log(`Client ${client.id} tracking order ${data.orderId}`);
  }

  @SubscribeMessage('driverUpdate')
  handleDriverUpdate(
    @MessageBody() data: { orderId: string; lat: number; lng: number },
    @ConnectedSocket() client: Socket,
  ) {
    this.server.to(`order:${data.orderId}`).emit('locationUpdate', {
      lat: data.lat,
      lng: data.lng,
      timestamp: new Date().toISOString(),
    });
  }

  emitDeliveryUpdate(orderId: string, payload: any) {
    this.server.to(`order:${orderId}`).emit('deliveryUpdate', payload);
  }

  emitLocationUpdate(orderId: string, location: { lat: number; lng: number }) {
    this.server.to(`order:${orderId}`).emit('locationUpdate', {
      ...location,
      timestamp: new Date().toISOString(),
    });
  }
}
