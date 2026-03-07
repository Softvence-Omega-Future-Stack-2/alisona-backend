import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MakeBookingDto } from './dto/make.booking.dto';
import { StripeService } from 'src/stripe/stripe.service';
import Stripe from 'stripe';
import { BookingSlotStatus } from '@prisma/client';
import { PrivateResultType } from '@prisma/client/runtime/client';

@Injectable()
export class BookingService {
    private stripeType: Stripe;
    constructor(private readonly prisma: PrismaService, private readonly stripe: StripeService) {
        this.stripeType = new Stripe(process.env.STRIPE_SECRATE_KEY as string, {
            apiVersion: "2026-02-25.clover"
        })
    };

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

        // const paymentIntent = await this.stripe.createPayment(dto.price);
        const checkout = await this.stripe.createCheckoutSession(dto.price);


        return {
            booking,
            event,
            user,
            // clientSrcrate: paymentIntent.client_secret
            url: checkout.url
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

    async handleWebhookEvent(event: Stripe.Event) {

        try {
            switch (event.type) {
                case 'payment_intent.succeeded':
                    console.log("Successssssssssssssssssssssssssssssssssssssssssssssssssssssssss");
                    break;

                case 'payment_intent.payment_failed':
                    console.log("Payment Faild..................................................");
                    break;

                case 'payment_intent.canceled':
                    console.log("Payment Cahcled.....................................................................");
                    break;

                default:
                    console.log(`ℹ️ Unhandled event type: ${event.type}`);
            }

        } catch (error) {

            throw error;
        }
    }

    async bookingStatusUpdate(bookingId: string, status: BookingSlotStatus) {
        const booking = await this.prisma.booking.findUnique({
            where: {
                bookingId: bookingId
            }
        });

        if (!booking) throw new NotFoundException("Booking not found");

        const result = await this.prisma.booking.update({
            where: {
                bookingId: bookingId
            },
            data: {
                bookingConfarmStatus: status
            }
        });

        return result;

    }

}
