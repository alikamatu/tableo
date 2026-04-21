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
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AnalyticsSnapshotJob } from './jobs/processors/analytics-snapshot.job';

@Module({
  imports: [
    // ─── Config ───────────────────────────────────────────────────────────────
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),

    // ─── Rate limiting ────────────────────────────────────────────────────────
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('THROTTLE_TTL', 60000),
            limit: config.get<number>('THROTTLE_LIMIT', 100),
          },
        ],
      }),
    }),

    // ─── Cron jobs ────────────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ─── BullMQ ───────────────────────────────────────────────────────────────
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST', 'localhost'),
          port: config.get<number>('REDIS_PORT', 6379),
          password: config.get<string>('REDIS_PASSWORD') || undefined,
        },
      }),
    }),

    // ─── Core infra ───────────────────────────────────────────────────────────
    PrismaModule,
    RedisModule,

    // ─── Feature modules ──────────────────────────────────────────────────────
    AuthModule,
    RestaurantsModule,
    BranchesModule,
    MenuModule,
    OrdersModule,
    StaffModule,
    AnalyticsModule,
    SubscriptionsModule,
    UploadsModule,
  ],
  providers: [
    // JwtAuthGuard applied globally — use @Public() to opt out
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    AnalyticsSnapshotJob,
  ],
})
export class AppModule {}
