import { Module } from '@nestjs/common';
import { ScaleService } from './scale.service';
import { ScaleController } from './scale.controller';

@Module({
  providers: [ScaleService],
  controllers: [ScaleController],
  exports: [ScaleService],
})
export class ScaleModule {}
