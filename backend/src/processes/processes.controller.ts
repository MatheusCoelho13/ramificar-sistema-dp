import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { Role, User } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';

@Controller('processes')
@UseGuards(JwtAuthGuard)
export class ProcessesController {
  constructor(private processesService: ProcessesService) {}

  // Funcionário abre processo
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.FUNCIONARIO)
  create(@Body() dto: CreateProcessDto, @CurrentUser() user: User) {
    return this.processesService.create(dto, user);
  }

  // Funcionário lista seus processos
  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(Role.FUNCIONARIO)
  findMy(@CurrentUser() user: User) {
    return this.processesService.findMyProcesses(user);
  }

  // Defensor lista processos atribuídos a ele
  @Get('assigned')
  @UseGuards(RolesGuard)
  @Roles(Role.DEFENSOR,)
  findAssigned(@CurrentUser() user: User) {
    return this.processesService.findDefenderProcesses(user);
  }

  // Alertas de inatividade para o defensor
  @Get('alerts')
  @UseGuards(RolesGuard)
  @Roles(Role.DEFENSOR,)
  getAlerts(@CurrentUser() user: User) {
    return this.processesService.getAlertedProcesses(user);
  }

  // Detalhe para funcionário (sem identidade do defensor)
  @Get(':id/funcionario')
  @UseGuards(RolesGuard)
  @Roles(Role.FUNCIONARIO)
  findOneForFuncionario(@Param('id') id: string, @CurrentUser() user: User) {
    return this.processesService.findOneForFuncionario(id, user);
  }

  // Detalhe para defensor (com nome do funcionário)
  @Get(':id/defensor')
  @UseGuards(RolesGuard)
  @Roles(Role.DEFENSOR,)
  findOneForDefender(@Param('id') id: string, @CurrentUser() user: User) {
    return this.processesService.findOneForDefender(id, user);
  }

  // Defensor atualiza status e prazo
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.DEFENSOR,)
  update(@Param('id') id: string, @Body() dto: UpdateProcessDto, @CurrentUser() user: User) {
    return this.processesService.update(id, dto, user);
  }
}
