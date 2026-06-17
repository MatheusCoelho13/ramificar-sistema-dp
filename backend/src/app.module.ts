import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ScaleModule } from './scale/scale.module';
import { ProcessesModule } from './processes/processes.module';
import { MessagesModule } from './messages/messages.module';
import { WorkloadModule } from './workload/workload.module';
import { PulseModule } from './pulse/pulse.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ScaleModule,
    ProcessesModule,
    MessagesModule,
    WorkloadModule,
    PulseModule,
  ],
})
export class AppModule {}
