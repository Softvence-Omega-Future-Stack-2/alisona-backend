import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/publish.event';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { EventStatus, eventType } from '@prisma/client';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post('publish-event')
  @UseInterceptors(FileInterceptor('thumbnail'))
  @ApiConsumes('multipart/form-data')
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
    return await this.eventService.PublishEvent(thumbnail, dto);
  }

}
