import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ScaleService } from './scale.service';
import { SetScaleDto } from './dto/set-scale.dto';

@Controller('scale')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles( Role.DEFENSOR)
export class ScaleController {
  constructor(private scaleService: ScaleService) {}

  @Get()
  getScale(@Query('from') from: string, @Query('to') to: string) {
    return this.scaleService.getScale(from, to);
  }


