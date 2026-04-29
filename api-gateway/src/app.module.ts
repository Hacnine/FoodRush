import { Module } from '@nestjs/common';
import { ProxyModule } from './proxy/proxy.module';
import { AuthGuardModule } from './auth/auth-guard.module';

@Module({
  imports: [AuthGuardModule, ProxyModule],
})
export class AppModule {}
