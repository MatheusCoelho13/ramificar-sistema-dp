import { Module } from '@nestjs/common';
import { WorkloadService } from './workload.service';
import { WorkloadController } from './workload.controller';

@Module({
  providers: [WorkloadService],
  controllers: [WorkloadController],
})
export class WorkloadModule {}
