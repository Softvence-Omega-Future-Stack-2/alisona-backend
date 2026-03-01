import { Injectable } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateEventDto } from './dto/publish.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { eventType } from '@prisma/client';

@Injectable()
export class EventService {
    constructor(private readonly cloudinaryService: CloudinaryService, private readonly prisma: PrismaService) { }

    async PublishEvent(thumbnail: Express.Multer.File, data: CreateEventDto) {
        const image: any = await this.cloudinaryService.uploadImageFromBuffer(thumbnail.buffer, "thumbnail", `thumbnail-${Date.now()}-${Math.random()}`);
        console.log(data.startTime);
        const event = await this.prisma.event.create({
            data: {
                thumbnail: image.secure_url,
                availableSeats: data.availableSeats,
                ...data
            }
        });
        return event;
    }


}
