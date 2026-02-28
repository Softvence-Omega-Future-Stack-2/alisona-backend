import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/sign.up.dto';
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { SignInDto } from './dto/sign.in.dto';
import { ConfigService } from '@nestjs/config';
import { IEnv } from 'src/config/env.config';
import { RefreshTokenDto } from './dto/refresh.token.dto';
import { MailService } from '../mail/mail.service';
import { SentOTPDto } from './dto/sent.otp.dto';
// import admin from 'src/config/firebase.admin.config';
// import { FirebaseLoginDto } from './dto/firebase.login';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService, private readonly configService: ConfigService, private readonly mailService: MailService) { }

    async generateToken(user: any) {
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.userId, email: user.email, role: user.role
            },
            {
                secret: this.configService.get<IEnv>("env")?.jwtSecret,
                expiresIn: "7d"
            }
        );

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user.userId, email: user.email, role: user.role
            },
            {
                secret: this.configService.get<IEnv>("env")?.jwtRefreshSecret,
                expiresIn: "30d"
            }
        );

        return { accessToken, refreshToken };

    }

    async hashPassword(password: string) {
        const hast = await bcrypt.hash(password, 10);
        return hast;
    }

    async SignUp(data: SignUpDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (user) throw new BadRequestException(`${user.email} already use this email`);

        const hastPassword = await this.hashPassword(data.password);

        const createUser = await this.prisma.user.create({
            data: {
                username: data.username,
                email: data.email,
                password: hastPassword
            }
        });

        return createUser;
    };

    async SignIn(data: SignInDto) {
        const user = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (!user) throw new NotFoundException(`User dose not exist with email ${data.email}.`);

        const matchPassword = await bcrypt.compare(data.password, user.password as string);

        if (!matchPassword) throw new ForbiddenException("Invalid password.");

        const tokens = await this.generateToken(user);

        await this.prisma.user.update({ where: { userId: user.userId }, data: { refreshToken: tokens.refreshToken } })

        const { password, refreshToken, otp, ...info } = user;

        return {
            tokens,
            user: info
        }

    }

    // async firebaseLogin(dto: FirebaseLoginDto) {
    //     const decoded = await admin.auth().verifyIdToken(dto.idToken);

    //     let user = await this.prisma.user.findUnique({
    //         where: {
    //             userId: decoded.uid
    //         }
    //     });

    //     const record = await admin.auth().getUser(decoded.uid);

    //     const email = decoded.email ?? record.email ?? '';

    //     if (!email) throw new NotFoundException("email not found");

    //     const firebaseProvider = decoded.firebase.sign_in_provider;
    //     const providerMap = {
    //         'apple.com': 'APPLE',
    //         'google.com': 'GOOGLE'
    //     };
    //     const provider = providerMap[firebaseProvider] || 'CREDENTIAL';

    //     if (!user) {
    //         user = await this.prisma.user.create({
    //             data: {
    //                 userId: decoded.uid,
    //                 email: email,
    //                 username: record.displayName,
    //                 profile: record.photoURL,
    //                 provider: provider
    //             }
    //         })
    //     }

    //     const tokens = await this.generateToken(user);

    //    await this.prisma.user.update({ where: { userId: user.userId }, data: { refreshToken: tokens.refreshToken } })

    //     const { password, refreshToken, otp, ...info } = user;

    //     return {
    //         tokens,
    //         user: info
    //     }

    // }

    async generateAccessTokenUseRefreshToken(data: RefreshTokenDto) {
        try {

            const payload = this.jwtService.verify(data.refreshToken, {
                secret: this.configService.get<IEnv>("env")?.jwtRefreshSecret,
            });

            if (!payload) throw new ForbiddenException("Invalid refresh token");

            const user = await this.prisma.user.findUnique({
                where: { userId: payload.sub },
            });

            if (!user) throw new ForbiddenException("Invalid user refresh token");

            const tokens = await this.generateToken(user);

            return {
                refreshToken: tokens.refreshToken,
            };
        } catch (err) {

            if (err instanceof Error && err.name === "JsonWebTokenError") {
                throw new ForbiddenException("Refresh token corrupted");
            }

            if (err instanceof Error && err.name === "TokenExpiredError") {
                throw new ForbiddenException("Refresh token expired");
            };

            throw new InternalServerErrorException("Could not refresh token");
        }


    }

    async sentOtpInEmail(data: SentOTPDto) {
        const findUser = await this.prisma.user.findUnique({
            where: {
                email: data.email
            }
        });

        if (!findUser) throw new NotFoundException("Email not found");

        await this.mailService.sendMail(data.email, "sent otp", "5060");

        return {
            success: true
        }

    }

}
