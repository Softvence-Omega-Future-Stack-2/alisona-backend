import { Body, Controller, Headers, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MakeBookingDto } from './dto/make.booking.dto';
import Stripe from 'stripe';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/Decorator/roles.decorator';

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
  @ApiExcludeEndpoint()
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
  };


  @Patch(':bookingId/status')
  @ApiOperation({ summary: 'Update booking confirmation status (Only Can Admin)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiParam({
    name: 'bookingId',
    example: 'bk_123456'
  })
  @ApiBody({
    type: UpdateBookingStatusDto
  })
  @ApiResponse({
    status: 200,
    description: 'Booking status updated successfully'
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found'
  })
  async bookingStatusUpdate(
    @Param('bookingId') bookingId: string,
    @Body() body: UpdateBookingStatusDto
  ) {
    return this.bookingService.bookingStatusUpdate(
      bookingId,
      body.status
    );
  }


}
