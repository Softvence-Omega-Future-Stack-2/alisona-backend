import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { MailModule } from './modules/mail/mail.module';
import { EventModule } from './modules/event/event.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { BookingModule } from './modules/booking/booking.module';
import { FavouriteModule } from './modules/favourite/favourite.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { StripeModule } from './stripe/stripe.module';
import envConfig from './config/env.config';

@Module({
  imports: [PrismaModule, MailModule, ConfigModule.forRoot({
    isGlobal: true,
    load: [envConfig],
    cache: true
  }), AuthModule, UserModule, EventModule, CloudinaryModule, BookingModule, FavouriteModule, DashboardModule, StripeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
