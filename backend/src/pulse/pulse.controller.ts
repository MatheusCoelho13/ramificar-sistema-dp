import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PulseService } from './pulse.service';
import { PulseDto } from './dto/pulse.dto';

@Controller('pulse')
@UseGuards(JwtAuthGuard)
export class PulseController {
  constructor(private pulseService: PulseService) {}

  @Post()
  register(@Body() dto: PulseDto, @CurrentUser() user: User) {
    return this.pulseService.register(dto, user);
  }

  @Get('today')
  hasRegistered(@CurrentUser() user: User) {
    return this.pulseService.hasRegisteredToday(user);
  }

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(Role.DEFENSOR,)
  getDashboard(@Query('date') date?: string) {
    return this.pulseService.getDashboard(date);
  }
}
