import { Body, Controller, DefaultValuePipe, Get, ParseIntPipe, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/publish.event';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventStatus, eventType } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from 'src/Decorator/roles.decorator';
import { RolesGuard } from 'src/guard/roles.guard';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post('publish-event')
  @ApiOperation({ summary: "(Only Can Admin)" })
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        thumbnail: {
          type: 'string',
          format: 'binary',
        },
        title: { type: 'string', example: 'Tech Conference 2026' },
        category: { type: 'string', example: 'TECH' },
        eventType: { type: 'string', enum: Object.values(eventType), example: eventType.PAID },
        description: { type: 'string' },
        eventDate: { type: 'string', example: '2026-05-20T00:00:00.000Z' },
        startTime: { type: 'string', example: '10:00' },
        endTime: { type: 'string', example: '13:00' },
        duration: { type: 'string', example: '3 hours' },
        price: { type: 'number', example: 500 },
        capacity: { type: 'number', example: 200 },
        venueName: { type: 'string' },
        address: { type: 'string' },
        isFamilyFriendly: { type: 'boolean' },
        city: { type: 'string' },
        latitude: { type: 'number', example: 23.8103 },
        longitude: { type: 'number', example: 90.4125 },
        about: { type: 'string' },
        whatToExpect: { type: 'string' },
        cancellationPolicy: { type: 'string' },
        ageLimit: { type: 'string' },
        highlights: {
          type: 'array',
          items: { type: 'string' },
          example: ['Networking', 'Certificate'],
        },
        status: { type: 'string', enum: Object.values(EventStatus), example: EventStatus.ACTIVE },
      },
    },
  })
  async publishEvent(
    @UploadedFile() thumbnail: Express.Multer.File,
    @Body() dto: CreateEventDto,
  ) {
    const result = await this.eventService.PublishEvent(thumbnail, dto);
    return {
      success: true,
      message: "Event published success",
      data: result
    }
  }


  @Get()
  @ApiOperation({ summary: 'Get all active events with optional filters' })
  @ApiResponse({ status: 200, description: 'Events fetched successfully' })

  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiQuery({ name: 'search', required: false, example: 'music', type: String })
  @ApiQuery({ name: 'category', required: false, example: 'Concert', type: String })
  @ApiQuery({ name: 'city', required: false, example: 'Dubai', type: String })
  @ApiQuery({ name: 'minPrice', required: false, example: 0, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, example: 100, type: Number })
  @ApiQuery({ name: 'freeOnly', required: false, example: true, type: Boolean })
  @ApiQuery({ name: 'familyFriendly', required: false, example: true, type: Boolean })
  @ApiQuery({ name: 'upcoming', required: false, example: true, type: Boolean })

  async getAllEvents(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('freeOnly') freeOnly?: string,
    @Query('familyFriendly') familyFriendly?: string,
    @Query('upcoming') upcoming?: string,
  ) {
    return this.eventService.getAllEvent(
      page ?? 1,
      limit ?? 10,
      search,
      category,
      city,
      minPrice ? Number(minPrice) : undefined,
      maxPrice ? Number(maxPrice) : undefined,
      freeOnly === 'true',
      familyFriendly === 'true',
      upcoming === 'true',
    );
  }


  @Get('event-calender')
  @ApiOperation({ summary: 'Get event count grouped by month and day' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  async getEventDays() {
    const result = await this.eventService.getEventDay();
    return {
      success: true,
      message: 'Fetched events grouped by month and day successfully',
      data: result,
    };
  }

}
