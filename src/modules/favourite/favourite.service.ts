import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavouriteService {
    constructor(private readonly prisma: PrismaService) { }

    async addFavourite(userId: string, eventId: string) {

        const existing = await this.prisma.favourite.findFirst({
            where: { userId, eventId },
        });
        if (existing) {
            throw new BadRequestException("Event is already in favourites");
        }

        const favourite = await this.prisma.favourite.create({
            data: { userId, eventId },
            include: {
                event: true,
                user: true,
            },
        });

        return favourite;
    }


    async removeFavourite(userId: string, eventId: string) {
        const favourite = await this.prisma.favourite.findFirst({
            where: { userId, eventId },
        });

        if (!favourite) {
            throw new NotFoundException("Favourite not found");
        }

        await this.prisma.favourite.delete({
            where: { favouriteId: favourite.favouriteId },
        });

        return { message: "Favourite removed successfully" };
    }

    async getUserFavourites(userId: string) {
        const favourites = await this.prisma.favourite.findMany({
            where: { userId },
            include: { event: true },
        });

        return favourites;
    }


}
