import { Body, Controller, Delete, Get, Param, Patch, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/user.profile.update.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/Decorator/roles.decorator';

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

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete a user by userId (Only Can Admin)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiParam({ name: 'userId', example: 'usr_12345', description: 'Unique User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('userId') userId: string) {
    return this.userService.deleteUser(userId);
  }

  @Patch(':userId/status')
  @ApiOperation({ summary: 'Update user status (Only Can Admin)' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  @ApiParam({ name: 'userId', example: 'usr_12345', description: 'Unique User ID' })
  @ApiBody({ type: UpdateUserStatusDto })
  @ApiResponse({ status: 200, description: 'User status updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() body: UpdateUserStatusDto,
  ) {
    return this.userService.updateUserStatus(userId, body.status);
  }


  @Get("getMe")
  @ApiOperation({summary : "Get me"})
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"))
  @ApiOperation({ summary: "Get me" })
  async getMe(@Req() req: any) {
    const userId = req.user.userId;
    return await this.userService.getMe(userId);
  }

  @Get('get-single-user/:userId')
  @ApiOperation({summary : "Get Single user (Only Can Admin)"})
  @ApiBearerAuth()
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  async getSingleUser(@Param('userId') userId: string) {
    return await this.userService.getMe(userId);
  }

}
