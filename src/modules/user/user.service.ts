import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/user.profile.update.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

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

}
