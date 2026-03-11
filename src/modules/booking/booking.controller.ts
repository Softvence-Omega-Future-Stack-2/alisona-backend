import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiBody, ApiExcludeEndpoint, ApiOperation, ApiParam, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MakeBookingDto } from './dto/make.booking.dto';
import Stripe from 'stripe';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/Decorator/roles.decorator';
import { BookingSlotStatus, bookingStatus } from '@prisma/client';

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
      clientSrcrate: result.url
    }

  }


  @Get("my-booking")
  @ApiOperation({ summary: "My All Booking" })
  @ApiBearerAuth()

  @ApiQuery({
    name: "page",
    required: false,
    example: 1
  })

  @ApiQuery({
    name: "limit",
    required: false,
    example: 10
  })

  @ApiQuery({
    name: "status",
    enum: bookingStatus,
    required: false,
    description: "Filter by booking status"
  })

  @ApiQuery({
    name: "bookingConfarmStatus",
    enum: BookingSlotStatus,
    required: false,
    description: "Filter by confirm status"
  })

  @UseGuards(AuthGuard("jwt"))
  async myBooking(
    @Req() req: any,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 10,
    @Query("status") status?: bookingStatus,
    @Query("bookingConfarmStatus") bookingConfarmStatus?: BookingSlotStatus
  ) {

    const userId = req.user.userId;

    const result = await this.bookingService.myBooking(userId, Number(page), Number(limit), status, bookingConfarmStatus);

    return {
      success: true,
      ...result
    };
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



  @Get('payment/success')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Stripe Payment Success' })
  @ApiResponse({ status: 200, description: 'Payment completed successfully' })
  async paymentSuccess(
  ) {

    return {
      success: true,
      message: "Payment completed successfully"
    };
  }


  @Get('payment/cancel')
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Stripe Payment Cancelled' })
  @ApiResponse({ status: 200, description: 'Payment cancelled' })
  async paymentCancel() {

    return {
      success: false,
      message: "Payment was cancelled"
    };
  }

}
