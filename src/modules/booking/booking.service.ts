import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MakeBookingDto } from './dto/make.booking.dto';

@Injectable()
export class BookingService {
    constructor(private readonly prisma: PrismaService) { };

    async makeBooking(userId: string, dto: MakeBookingDto) {
        const event = await this.prisma.event.findUnique({
            where: { eventId: dto.eventId },
        });

        if (!event) throw new NotFoundException("Event not found😒");

        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User not found🙄")

        const calculationPrice = event.price;
        const totalPrice = calculationPrice * dto.quentity;

        if (totalPrice !== dto.price) {
            throw new BadRequestException(
                `Invalid total price. Expected ${totalPrice} but received ${dto.price}`
            );
        }

        const totalBooking = await this.prisma.booking.aggregate({
            where: { eventId: dto.eventId },
            _sum: { quentity: true }
        });

        const totalBookingCount = totalBooking._sum.quentity || 0;

        const remainingSeats = event.capacity - totalBookingCount;
        if (dto.quentity > remainingSeats) {
            throw new BadRequestException(
                `Only ${remainingSeats} seat(s) remaining, cannot book ${dto.quentity}`
            );
        }


        const booking = await this.prisma.booking.create({
            data: {
                userId,
                email: dto.email,
                eventId: dto.eventId,
                price: dto.price,
                quentity: dto.quentity,
                fullName: dto.fullName,
                phoneNumber: dto.phoneNumber,
                status: "FAILED"
            },
        });

        return {
            booking,
            event,
            user
        }

    }


    async myBooking(userId: string) {
        const booking = await this.prisma.booking.findMany({
            where: {
                userId: userId
            },
            include: {
                event: true
            }
        });

        return booking;

    }

}
