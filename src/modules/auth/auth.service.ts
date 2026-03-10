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
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change.password.dto';
import admin from 'src/config/firebase.admin.config';
import { FirebaseLoginDto } from './dto/firebase.login';

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

    };

    async verifyOtpToken(user: any) {
        const token = await this.jwtService.signAsync(
            {
                sub: user.userId, email: user.email, role: user.role
            },
            {
                secret: this.configService.get<IEnv>("env")?.jwtVerifyOtpTokenSectate,
                expiresIn: "5m"
            }
        );

        return { token }

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

    async firebaseLogin(dto: FirebaseLoginDto) {
        const decoded = await admin.auth().verifyIdToken(dto.idToken);

        let user = await this.prisma.user.findUnique({
            where: {
                userId: decoded.uid
            }
        });

        const record = await admin.auth().getUser(decoded.uid);

        const email = decoded.email ?? record.email ?? '';

        if (!email) throw new NotFoundException("email not found");

        const firebaseProvider = decoded.firebase.sign_in_provider;
        const providerMap = {
            'apple.com': 'APPLE',
            'google.com': 'GOOGLE'
        };
        const provider = providerMap[firebaseProvider] || 'CREDENTIAL';

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    userId: decoded.uid,
                    email: email,
                    username: record.displayName,
                    profile: record.photoURL,
                    provider: provider
                }
            })
        }

        const tokens = await this.generateToken(user);

       await this.prisma.user.update({ where: { userId: user.userId }, data: { refreshToken: tokens.refreshToken } })

        const { password, refreshToken, otp, ...info } = user;

        return {
            tokens,
            user: info
        }

    }

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

        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiry = new Date(Date.now() + 1 * 60 * 1000);

        await this.mailService.sendMail(data.email, "Forgot Password Request", otp);

        await this.prisma.user.update({
            where: {
                email: data.email
            },
            data: {
                otp: otp,
                otpExpiry: otpExpiry
            }
        })

        return {
            success: true
        }

    };

    async verifyOtp(data: VerifyOtpDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: data.email }
            });

            if (!user) {
                throw new NotFoundException("No account found with this email address.");
            }

            if (!user.otp) {
                throw new BadRequestException("No OTP request found. Please request a new OTP.");
            }

            if (!user.otpExpiry) {
                throw new BadRequestException("OTP expiration data missing. Please request a new OTP.");
            }

            if (new Date() > user.otpExpiry) {
                throw new BadRequestException("Your OTP has expired. Please request a new one.");
            }

            if (user.otp !== data.otp) {
                throw new BadRequestException("The OTP you entered is incorrect. Please try again.");
            }

            await this.prisma.user.update({
                where: { email: data.email },
                data: {
                    otp: null,
                    otpExpiry: null
                }
            });

            const token = await this.verifyOtpToken(user);

            return {
                token: token.token
            };

        } catch (error) {
            if (
                error instanceof NotFoundException ||
                error instanceof BadRequestException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                "Something went wrong while verifying OTP. Please try again later."
            );
        }
    }


    async resetPassword(data: ResetPasswordDto) {
        try {
            const payload = await this.jwtService.verifyAsync(data.token, {
                secret: this.configService.get<IEnv>("env")?.jwtVerifyOtpTokenSectate,
            });

            const userId = payload.sub;

            const user = await this.prisma.user.findUnique({ where: { userId: userId } });
            if (!user) throw new NotFoundException("User not found");

            const hashedPassword = await bcrypt.hash(data.newPassword, 10);

            await this.prisma.user.update({
                where: { userId: userId },
                data: {
                    password: hashedPassword,
                    otp: null,
                    otpExpiry: null
                }
            });

            return {
                success: true,
                message: "Password updated successfully"
            };

        } catch (err) {
            throw new BadRequestException("Invalid or expired token. Please verify OTP again.");
        }
    }


    async changePassword(userId: string, dto: ChangePasswordDto) {

        const user = await this.prisma.user.findUnique({
            where: { userId }
        });


        if (!user) throw new NotFoundException("User not found");

        if (user.provider !== "CREDENTIAL") throw new BadRequestException("Password change is allowed only for users registered with email and password.")

        const isPasswordMatch = await bcrypt.compare(dto.oldPassword, user.password as string);
        if (!isPasswordMatch) throw new BadRequestException("Old password is incorrect");


        const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

        await this.prisma.user.update({
            where: { userId },
            data: { password: hashedPassword }
        });

        return { message: "Password changed successfully" };
    }
}
