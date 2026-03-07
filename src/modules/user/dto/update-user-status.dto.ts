import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { userStatus } from '@prisma/client';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: userStatus, example: userStatus.ACTIVE })
  @IsEnum(userStatus)
  status: userStatus;
}