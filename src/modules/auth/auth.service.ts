import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SignUpDto } from './dto/sign.up.dto';
import * as bcrypt from "bcrypt"
import { JwtService } from "@nestjs/jwt"
import { SignInDto } from './dto/sign.in.dto';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService) { }

    async generateToken(user: any) {
        const accessToken = await this.jwtService.signAsync(
            {
                sub: user.userId, email: user.email, role: user.role
            },
            {
                secret: "access_secrate",
                expiresIn: "7d"
            }
        );

        const refreshToken = await this.jwtService.signAsync(
            {
                sub: user.userId, email: user.email, role: user.role
            },
            {
                secret: "refresh_secrate",
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

        const matchPassword = await bcrypt.compare(data.password, user.password);

        if (!matchPassword) throw new ForbiddenException("Invalid password.");

        const tokens = await this.generateToken(user);

        const { password, refreshToken, otp, ...info } = user;

        return {
            tokens,
            user: info
        }

    }


}
