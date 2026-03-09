import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.profile.update.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { userStatus } from '@prisma/client';

@Injectable()
export class UserService {

    constructor(private readonly prisma: PrismaService, private readonly cloudinary: CloudinaryService) { }

    async updateProfile(userId: string, data: UpdateUserDto, profile?: Express.Multer.File) {
        const user = await this.prisma.user.findUnique({
            where: { userId }
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        let profileImageUrl = user.profile;

        if (profile) {
            const upload: any = await this.cloudinary.uploadImageFromBuffer(
                profile.buffer,
                "user",
                `profile-${Date.now()}-${Math.random()}`
            );

            profileImageUrl = upload.secure_url;
        }

        const updatedUser = await this.prisma.user.update({
            where: { userId },
            data: {
                username: data.username,
                email: data.email,
                profile: profileImageUrl,
            },
        });

        return {
            message: "Profile updated successfully",
            data: updatedUser,
        };
    }

    async deleteUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User not found");

        const result = await this.prisma.user.delete({
            where: {
                userId: userId
            }
        });
        return result;
    }

    async updateUserStatus(userId: string, status: userStatus) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User not found");

        const update = await this.prisma.user.update({
            where: {
                userId: userId
            },
            data: {
                status: status
            }
        })

    }


    async getMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: {
                userId: userId
            }
        });

        if (!user) throw new NotFoundException("User not found");

        const { password, otp, otpExpiry, refreshToken, ...rest } = user;

        return rest;
    }

}
