import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ERROR_MESSAGES } from "src/common/constants";
import { IEnv } from "src/config/env.config";
import { PrismaService } from "src/prisma/prisma.service";


@Injectable()
export class AtStrategie extends PassportStrategy(Strategy, "jwt") {
    constructor(private readonly prisma: PrismaService, private readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<IEnv>("env")?.jwtSecret,
        })
    };

    async validate(paylod: any) {
        const findUser = await this.prisma.user.findUnique({
            where: {
                userId: paylod.sub
            }
        });
        if (!findUser) throw new NotFoundException(ERROR_MESSAGES.USER_NOT_FOUND);

        if (findUser.status === "BAN" || findUser.status === "INACTIVE") {
            throw new UnauthorizedException(
                `Your account has been ${findUser.status.toLowerCase()}. Please contact support for assistance.`
            );
        }

        const { password, refreshToken, otp, otpExpiry, ...user } = findUser;
        return user;
    }

}