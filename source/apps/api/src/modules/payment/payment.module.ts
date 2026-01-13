import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './controllers/payment.controller';
import { SepayProvider } from './providers/sepay.provider';
import { RedisModule } from '../redis/redis.module';
import { WebsocketModule } from '../websocket/websocket.module';
import paymentConfig from '@/config/payment.config';

@Module({
  imports: [ConfigModule.forFeature(paymentConfig), RedisModule, WebsocketModule],
  controllers: [PaymentController],
  providers: [PaymentService, SepayProvider],
  exports: [PaymentService],
})
export class PaymentModule {}
