import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AnalyticsService } from '../../modules/analytics/analytics.service';

@Injectable()
export class AnalyticsSnapshotJob {
  private readonly logger = new Logger(AnalyticsSnapshotJob.name);

  constructor(private analytics: AnalyticsService) {}

  /**
   * Runs every day at midnight to generate analytics snapshots
   * for the previous day across all active branches.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailySnapshot() {
    this.logger.log('Starting daily analytics snapshot generation…');
    try {
      await this.analytics.generateAllSnapshots();
    } catch (error) {
      this.logger.error('Daily snapshot generation failed', error);
    }
  }
}
