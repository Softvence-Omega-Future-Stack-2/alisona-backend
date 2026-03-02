import { Body, Controller, Delete, Get, Post, Req, UseGuards } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FevouriteDto } from './dto/fevourite.dto';

@Controller('favourite')
export class FavouriteController {
  constructor(private readonly favouriteService: FavouriteService) { }

  @Post("add")
  @ApiOperation({ summary: "Add event to febroute list" })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  async addFevourite(@Body() dto: FevouriteDto, @Req() req: any) {
    const userId = req.user.userId;

    const result = await this.favouriteService.addFavourite(userId, dto.eventId);

    return {
      success: true,
      message: "Febourite add to the list"
    }

  }

  @Delete('remove')
  @ApiOperation({ summary: 'Remove event from favourite list' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async removeFavourite(@Body() dto: FevouriteDto, @Req() req: any) {
    const userId = req.user.userId;
    const result = await this.favouriteService.removeFavourite(userId, dto.eventId);

    return {
      success: true,
      message: 'Event removed from favourites successfully',
      data: result,
    };
  }


  @Get('list')
  @ApiOperation({ summary: 'Get all favourite events of the user' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getFavourites(@Req() req: any) {
    const userId = req.user.userId;
    const result = await this.favouriteService.getUserFavourites(userId);

    return {
      success: true,
      message: 'Fetched all favourite events successfully',
      data: result,
    };
  }

}
