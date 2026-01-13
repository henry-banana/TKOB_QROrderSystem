import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * OrderGateway - Real-time WebSocket Gateway for Order Updates
 *
 * Handles WebSocket connections for real-time order notifications.
 * Uses JWT authentication and tenant-based room isolation.
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/orders',
})
export class OrderGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(OrderGateway.name);
  private connectedClients = new Map<
    string,
    { tenantId: string; userId: string; connectedAt: Date }
  >();

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Handle new client connection
   *
   * Flow:
   * 1. Extract JWT token from handshake (auth or header)
   * 2. Verify token and extract tenantId, userId
   * 3. Store client info in memory
   * 4. Join tenant-specific room
   * 5. Send connection confirmation
   */
  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        this.logger.warn(
          `Client ${client.id} attempted connection without token`,
        );
        client.emit('error', { message: 'Authentication required' });
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const { tenantId, userId } = payload;

      if (!tenantId || !userId) {
        this.logger.warn(
          `Client ${client.id} has invalid token payload - missing tenantId or userId`,
        );
        client.emit('error', { message: 'Invalid token payload' });
        client.disconnect();
        return;
      }

      // Store client info
      this.connectedClients.set(client.id, {
        tenantId,
        userId,
        connectedAt: new Date(),
      });

      // Join tenant-specific room for isolation
      await client.join(`tenant:${tenantId}`);

      this.logger.log(
        `Client connected: ${client.id} (User: ${userId}, Tenant: ${tenantId}) - Total clients: ${this.connectedClients.size}`,
      );

      // Send connection confirmation
      client.emit('connected', {
        message: 'Connected to order updates',
        tenantId,
        userId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(
        `Authentication failed for client ${client.id}: ${error.message}`,
      );
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  /**
   * Handle client disconnection
   */
  handleDisconnect(client: Socket) {
    const clientInfo = this.connectedClients.get(client.id);

    if (clientInfo) {
      const sessionDuration = Date.now() - clientInfo.connectedAt.getTime();
      this.logger.log(
        `Client disconnected: ${client.id} (Tenant: ${clientInfo.tenantId}) - Session duration: ${Math.round(sessionDuration / 1000)}s - Remaining clients: ${this.connectedClients.size - 1}`,
      );
      this.connectedClients.delete(client.id);
    } else {
      this.logger.warn(`Unknown client disconnected: ${client.id}`);
    }
  }

  /**
   * Emit order created event to all clients in tenant
   *
   * @param tenantId - Tenant identifier
   * @param order - Order data
   */
  emitOrderCreated(tenantId: string, order: any) {
    this.server.to(`tenant:${tenantId}`).emit('order:created', {
      event: 'order:created',
      data: order,
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(
      `Emitted order:created to tenant:${tenantId} - Order: ${order.id}`,
    );
  }

  /**
   * Emit order status changed event
   *
   * @param tenantId - Tenant identifier
   * @param orderId - Order identifier
   * @param status - New order status
   * @param order - Full order data
   */
  emitOrderStatusChanged(
    tenantId: string,
    orderId: string,
    status: string,
    order: any,
  ) {
    this.server.to(`tenant:${tenantId}`).emit('order:status_changed', {
      event: 'order:status_changed',
      data: {
        orderId,
        status,
        order,
      },
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(
      `Emitted order:status_changed to tenant:${tenantId} - Order: ${orderId} - Status: ${status}`,
    );
  }

  /**
   * Emit payment completed event
   *
   * @param tenantId - Tenant identifier
   * @param orderId - Order identifier
   * @param payment - Payment data
   */
  emitPaymentCompleted(tenantId: string, orderId: string, payment: any) {
    this.server.to(`tenant:${tenantId}`).emit('order:payment_completed', {
      event: 'order:payment_completed',
      data: {
        orderId,
        payment,
      },
      timestamp: new Date().toISOString(),
    });

    this.logger.debug(
      `Emitted order:payment_completed to tenant:${tenantId} - Order: ${orderId} - Payment: ${payment.id}`,
    );
  }

  /**
   * Ping/Pong heartbeat handler
   */
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    const clientInfo = this.connectedClients.get(client.id);

    if (clientInfo) {
      this.logger.debug(
        `Heartbeat from client ${client.id} (Tenant: ${clientInfo.tenantId})`,
      );
    }

    return 'pong';
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }

  /**
   * Get connected clients by tenant
   */
  getConnectedClientsByTenant(tenantId: string): number {
    return Array.from(this.connectedClients.values()).filter(
      (client) => client.tenantId === tenantId,
    ).length;
  }

  /**
   * Disconnect all clients for a specific tenant (admin feature)
   */
  async disconnectTenant(tenantId: string) {
    const socketsInRoom = await this.server
      .in(`tenant:${tenantId}`)
      .fetchSockets();

    socketsInRoom.forEach((socket) => {
      socket.emit('disconnected', {
        message: 'Server initiated disconnect',
        reason: 'admin_action',
      });
      socket.disconnect(true);
    });

    this.logger.log(`Disconnected all clients for tenant: ${tenantId}`);
  }
}
