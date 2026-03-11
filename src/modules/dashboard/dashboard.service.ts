import { Injectable } from '@nestjs/common';
import { BookingSlotStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(private readonly prisma: PrismaService) { }

    async dashboardHome() {

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const totalUser = await this.prisma.user.count();
        const activeEvent = await this.prisma.event.count({ where: { status: "ACTIVE" } });
        const totalRevenueAggregate = await this.prisma.booking.aggregate({
            where: {
                status: "PAID"
            },
            _sum: {
                price: true
            }
        });

        const totalRevenue = totalRevenueAggregate._sum.price || 0;

        const totalBooking = await this.prisma.booking.count();
        const bookingToday = await this.prisma.booking.count({
            where: {
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
        });


        const now = new Date();

        const recent10Event = await this.prisma.event.findMany({
            where: {
                eventDate: {
                    gte: now,
                },
            },
            orderBy: {
                eventDate: "asc",
            },
            take: 10,
        });


        const recnt10ooking = await this.prisma.event.findMany({
            orderBy: {
                createdAt: "desc"
            },
            take: 10
        })

        return {
            dashboardData: {
                totalUser,
                activeEvent,
                totalRevenue,
                totalBooking,
                bookingToday
            },
            recent10Event,
            recnt10ooking
        }

    };

    async eventManagement(page: number = 1, limit: number = 10, search?: string, category?: string, status?: string) {
        const skip = (page - 1) * limit;

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);

        const totalUser = await this.prisma.user.count();

        const activeEvent = await this.prisma.event.count({
            where: { status: "ACTIVE" }
        });

        const totalRevenueAggregate = await this.prisma.booking.aggregate({
            where: { status: "PAID" },
            _sum: { price: true },
        });

        const totalRevenue = totalRevenueAggregate._sum.price || 0;

        const totalBooking = await this.prisma.booking.count();

        const bookingToday = await this.prisma.booking.count({
            where: {
                createdAt: {
                    gte: startOfToday,
                    lte: endOfToday,
                },
            },
        });

        const whereCondition: any = {};

        if (search) {
            whereCondition.OR = [
                {
                    title: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    city: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        if (category) {
            whereCondition.category = category;
        }

        if (status) {
            whereCondition.status = status as any;
        }

        const totalEvents = await this.prisma.event.count({
            where: whereCondition,
        });

        const events = await this.prisma.event.findMany({
            where: whereCondition,
            skip,
            take: limit,
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
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            dashboardData: {
                totalUser,
                activeEvent,
                totalRevenue,
                totalBooking,
                bookingToday,
            },
            pagination: {
                total: totalEvents,
                page,
                limit,
                totalPages: Math.ceil(totalEvents / limit),
            },
            data: events,
        };
    };

    async userManagement(page: number = 1, limit: number = 10, search?: string, status?: string) {
        const skip = (page - 1) * limit;

        const totalUser = await this.prisma.user.count();
        const totalActiveUser = await this.prisma.user.count({ where: { status: "ACTIVE" } });
        const totalBooking = await this.prisma.booking.count({ where: { status: "PAID" } });

        const whereCondition: any = {};

        if (search) {
            whereCondition.OR = [
                {
                    username: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive",
                    },
                },
            ];
        }

        if (status) {
            whereCondition.status = status as any;
        }

        const totalUsers = await this.prisma.user.count({
            where: whereCondition,
        });

        const users = await this.prisma.user.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc",
            },
            select: {
                userId: true,
                username: true,
                email: true,
                profile: true,
                role: true,
                status: true,
                provider: true,
                createdAt: true,
            },
        });

        return {
            dashboard: {
                totalUser,
                totalActiveUser,
                totalBooking
            },
            pagination: {
                total: totalUsers,
                page,
                limit,
                totalPages: Math.ceil(totalUsers / limit),
            },
            data: users,
        };
    }


    async bookingManagement(
        page: number = 1,
        limit: number = 10,
        search?: string,
        status?: BookingSlotStatus
    ) {
        const skip = (page - 1) * limit;

        // Where clause
        const whereClause: any = {};

        if (status) {
            whereClause.bookingConfarmStatus = status;
        }

        if (search) {
            whereClause.OR = [
                { fullName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phoneNumber: { contains: search, mode: 'insensitive' } }
            ];
        }

        const totalBookings = await this.prisma.booking.count({ where: whereClause });

        const revenueAggregate = await this.prisma.booking.aggregate({
            where: {
                status: "PAID",
                ...whereClause,
            },
            _sum: {
                price: true,
            },
        });

        const totalRevenue = revenueAggregate._sum.price || 0;

        const bookings = await this.prisma.booking.findMany({
            where: whereClause,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { userId: true, username: true, email: true }
                },
                event: true
            }
        });

        return {
            summary: {
                totalBookings,
                totalRevenue,
            },
            pagination: {
                total: totalBookings,
                page,
                limit,
                totalPages: Math.ceil(totalBookings / limit),
            },
            data: bookings
        };
    }

}
