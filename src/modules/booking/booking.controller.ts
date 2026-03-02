import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MakeBookingDto } from './dto/make.booking.dto';

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
      data: result.booking
    }

  }


}
