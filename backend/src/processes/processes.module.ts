import { Module } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { ProcessesController } from './processes.controller';
import { ScaleModule } from '../scale/scale.module';

@Module({
  imports: [ScaleModule],
  providers: [ProcessesService],
  controllers: [ProcessesController],
  exports: [ProcessesService],
})
export class ProcessesModule {}
