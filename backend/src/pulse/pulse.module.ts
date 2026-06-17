import { Module } from '@nestjs/common';
import { PulseService } from './pulse.service';
import { PulseController } from './pulse.controller';

@Module({
  providers: [PulseService],
  controllers: [PulseController],
})
export class PulseModule {}
