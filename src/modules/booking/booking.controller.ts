import { Body, Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MakeBookingDto } from './dto/make.booking.dto';
import Stripe from 'stripe';

@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) { }


  @Post("make-booking")
  @ApiOperation({ summary: "Make booking" })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  async makeBooking(@Body() dto: MakeBookingDto, @Req() req: any) {

    const userId = req.user.userId;

    const result = await this.bookingService.makeBooking(userId, dto);

    return {
      success: true,
      message: `Congratulations, ${result.user.username}! Your booking of ${dto.quentity} seat(s) for ${result.event.title} was successful.`,
      clientSrcrate: result.url
    }

  }


  @Post('webhook')
  async webhook(
    @Req() req: any,
    @Headers('stripe-signature') signature: string,
  ) {

    const stripe = new Stripe(process.env.STRIPE_SECRATE_KEY as string, {
      apiVersion: "2026-02-25.clover"
    });

    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );

    await this.bookingService.handleWebhookEvent(event);

    return { received: true };
  }

}
