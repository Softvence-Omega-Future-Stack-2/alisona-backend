import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { MailModule } from '../mail/mail.module';
import { AtStrategie } from './strategie/AtStrategie';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import envConfig from 'src/config/env.config';

@Module({
  imports: [
    MailModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [envConfig],
      cache: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AtStrategie],
  exports: [AtStrategie],
})
export class AuthModule { }