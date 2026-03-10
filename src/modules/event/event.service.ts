import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { CreateEventDto } from './dto/publish.event';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventService {
    constructor(private readonly cloudinaryService: CloudinaryService, private readonly prisma: PrismaService) { }

    async PublishEvent(thumbnail: Express.Multer.File, data: CreateEventDto) {
        const image: any = await this.cloudinaryService.uploadImageFromBuffer(thumbnail.buffer, "thumbnail", `thumbnail-${Date.now()}-${Math.random()}`);
        const event = await this.prisma.event.create({
            data: {
                thumbnail: image.secure_url,
                availableSeats: data.availableSeats,
                ...data
            }
        });
        return event;
    };

    async getAllEvent(page: number, limit: number, search?: string, category?: string, city?: string, minPrice?: number, maxPrice?: number, freeOnly?: boolean, familyFriendly?: boolean, upcoming?: boolean, status?: EventStatus) {
        const skip = (page - 1) * limit;
        const now = new Date();

        const where: any = {};

        if (search) {
            where.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    venueName: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    address: {
                        contains: search,
                        mode: "insensitive",
                    },
                }
            ];
        }

        if (category) {
            where.category = category;
        }

        if (city && city.trim() !== "" && city !== "All Emirates") {
            where.city = city;
        }

        if (minPrice !== undefined && maxPrice !== undefined) {
            where.price = {
                gte: minPrice,
                lte: maxPrice,
            };
        }

        if (freeOnly) {
            where.eventType = "FREE";
        }

        if (familyFriendly) {
            where.isFamilyFriendly = true;
        }

        if (upcoming) {
            where.eventDate = {
                gte: now,
            };
        }

        if (status) {
            where.status = status
        }

        const events = await this.prisma.event.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                eventDate: "asc",
            },
            include: {
                _count: {
                    select: {
                        bookings: {
                            where: {
                                status: "PAID"
                            }
                        }
                    }
                }
            }
        })

        const total = await this.prisma.event.count({ where });
        const totalActiveEvent = await this.prisma.event.count({ where: { status: "ACTIVE" } });
        const totalIncativeEvent = await this.prisma.event.count({ where: { status: "INACTIVE" } });
        const totalFreeEvent = await this.prisma.event.count({ where: { eventType: "FREE" } });
        const totalPaidEvent = await this.prisma.event.count({ where: { eventType: "PAID" } });

        return {
            meta: {
                page,
                limit,
                total,
                totalPage: Math.ceil(total / limit),
            },
            eventData: { totalActiveEvent, totalIncativeEvent, totalFreeEvent, totalPaidEvent },
            data: events,
        };
    };

    async getSingleEvent(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: {
                eventId: eventId
            }
        });

        if (!event) throw new NotFoundException("Event not found");

        return event
    };

    async getEventDay() {
        const events = await this.prisma.event.findMany(); // all event data

        const totalActiveEvent = await this.prisma.event.count({ where: { status: "ACTIVE" } });
        const totalIncativeEvent = await this.prisma.event.count({ where: { status: "INACTIVE" } });
        const totalFreeEvent = await this.prisma.event.count({ where: { eventType: "FREE" } });
        const totalPaidEvent = await this.prisma.event.count({ where: { eventType: "PAID" } });

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const result: any = {};

        events.forEach((e) => {
            const date = new Date(e.eventDate);

            const year = date.getFullYear();
            const monthName = monthNames[date.getMonth()];
            const day = date.getDate();

            const monthKey = `${monthName} ${year}`;
            const dayKey = `${year}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

            if (!result[monthKey]) result[monthKey] = { total: 0, days: {} };
            result[monthKey].total += 1;

            if (!result[monthKey].days[dayKey]) {
                result[monthKey].days[dayKey] = {
                    total: 0,
                    events: []
                };
            }

            result[monthKey].days[dayKey].total += 1;

            // push full event object
            result[monthKey].days[dayKey].events.push(e);
        });

        return {
            totalActiveEvent,
            totalFreeEvent,
            totalIncativeEvent,
            totalPaidEvent,
            data: result
        };
    }
    async deleteEvent(eventId: string) {
        const event = await this.prisma.event.findUnique({
            where: {
                eventId: eventId
            }
        });

        if (!event) throw new NotFoundException("Event Not foud");

        const result = await this.prisma.event.delete({
            where: {
                eventId: eventId
            }
        });
        return result;
    };

    async updateEvent(id: string, updateEventDto: UpdateEventDto) {

        const event = await this.prisma.event.findUnique({
            where: { eventId: id },
        });

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        const updatedEvent = await this.prisma.event.update({
            where: { eventId: id },
            data: updateEventDto,
        });

        return {
            message: 'Event updated successfully',
            data: updatedEvent,
        };
    };

}
