import { Body, Controller, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/user.profile.update.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Patch("update-profile")
  @ApiOperation({ summary: "Update user profile with image" })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        username: { type: "string", example: "Mohammad Jihad" },
        email: { type: "string", example: "user@gmail.com" },
        profile: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor("profile"))
  async updateProfile(
    @Req() req,
    @Body() data: UpdateUserDto,
    @UploadedFile() profile?: Express.Multer.File
  ) {
    return this.userService.updateProfile(req.user.userId, data, profile);
  }

}
