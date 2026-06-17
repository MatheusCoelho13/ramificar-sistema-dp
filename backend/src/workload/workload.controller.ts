import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { WorkloadService } from './workload.service';

@Controller('workload')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DEFENSOR)
export class WorkloadController {
  constructor(private workloadService: WorkloadService) {}

  @Get()
  getReports(@Query('year') year: string, @Query('month') month: string) {
    return this.workloadService.getReports(Number(year), Number(month));
  }

  @Post('generate')
  generate(@Body() body: { year: number; month: number }) {
    return this.workloadService.generateReport(body.year, body.month);
  }
}
