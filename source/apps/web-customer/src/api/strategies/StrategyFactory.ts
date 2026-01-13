// Strategy Factory - creates appropriate strategies based on API mode

import { USE_MOCK_API } from '@/lib/constants';
import { IMenuStrategy, ITableStrategy, IOrderStrategy } from './interfaces';
import { ICartStrategy } from './interfaces/ICartStrategy';
import { ICheckoutStrategy } from './interfaces/ICheckoutStrategy';
import { IPaymentStrategy } from './interfaces/IPaymentStrategy';
import { RealMenuStrategy, RealTableStrategy, RealOrderStrategy, RealCartStrategy, RealCheckoutStrategy, RealPaymentStrategy } from './real';
import { MockMenuStrategy, MockTableStrategy, MockOrderStrategy } from './mock';

export class StrategyFactory {
  static createMenuStrategy(): IMenuStrategy {
    return USE_MOCK_API ? new MockMenuStrategy() : new RealMenuStrategy();
  }
  
  static createTableStrategy(): ITableStrategy {
    return USE_MOCK_API ? new MockTableStrategy() : new RealTableStrategy();
  }
  
  static createOrderStrategy(): IOrderStrategy {
    return USE_MOCK_API ? new MockOrderStrategy() : new RealOrderStrategy();
  }

  static createCartStrategy(): ICartStrategy {
    // Mock cart not implemented yet - use real API
    return new RealCartStrategy();
  }

  static createCheckoutStrategy(): ICheckoutStrategy {
    // Mock checkout not implemented yet - use real API
    return new RealCheckoutStrategy();
  }

  static createPaymentStrategy(): IPaymentStrategy {
    // Mock payment not implemented yet - use real API
    return new RealPaymentStrategy();
  }
}
