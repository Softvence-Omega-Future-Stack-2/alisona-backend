import { Inject, Injectable } from '@nestjs/common';
import Stripe, { } from "stripe"

@Injectable()
export class StripeService {


    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRATE_KEY as string, {
            apiVersion: "2026-02-25.clover"
        })
    };

    async createPayment(amount: number, bookingId: string) {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "usd",
            payment_method_types: ["card"],
            metadata: {
                bookingId: bookingId
            }
        });

        return paymentIntent;

    }

    async createCheckoutSession(price: number, bookingId: string) {

        const session = await this.stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: "Event Booking",
                        },
                        unit_amount: price * 100,
                    },
                    quantity: 1
                },
            ],
            payment_intent_data: {
                metadata: {
                    bookingId: bookingId
                }
            },

            success_url: `${process.env.FRONTEND_SUCCESS_URL}`,
            cancel_url: `${process.env.FRONTEND_CANCEL_URL}`
        });

        return session;
    }


}
