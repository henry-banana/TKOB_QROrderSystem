import { Module } from '@nestjs/common';
import { MenuModule } from '../menu/menu.module';
import { WebsocketModule } from '../websocket/websocket.module';
import { CartController } from './controllers/cart.controllers';
import { CartService } from './services/cart.service';
import { TableModule } from '../table/table.module';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';

@Module({
  imports: [MenuModule, TableModule, WebsocketModule],
  controllers: [CartController, OrderController],
  providers: [
    // Services
    CartService,
    OrderService,
  ],
  exports: [CartService, OrderService],
})
export class OrderModule {}
