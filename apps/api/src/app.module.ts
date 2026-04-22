import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './config/prisma.module';
import { RedisModule } from './config/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { BranchesModule } from './modules/branches/branches.module';
import { MenuModule } from './modules/menu/menu.module';
import { OrdersModule } from './modules/orders/orders.module';
import { StaffModule } from './modules/staff/staff.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { ManagerModule } from './modules/manager/manager.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        throttlers: [{ ttl: c.get('THROTTLE_TTL', 60000), limit: c.get('THROTTLE_LIMIT', 100) }],
      }),
    }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        connection: {
          host: c.get('REDIS_HOST', 'localhost'),
          port: c.get('REDIS_PORT', 6379),
          password: c.get('REDIS_PASSWORD') || undefined,
        },
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    OnboardingModule,
    ManagerModule,
    RestaurantsModule,
    BranchesModule,
    MenuModule,
    OrdersModule,
    StaffModule,
    AnalyticsModule,
    SubscriptionsModule,
    UploadsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
