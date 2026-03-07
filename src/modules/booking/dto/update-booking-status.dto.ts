import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { BookingSlotStatus } from '@prisma/client';

export class UpdateBookingStatusDto {

    @ApiProperty({
        enum: BookingSlotStatus,
        example: BookingSlotStatus.NOT_CONFIRM
    })
    @IsEnum(BookingSlotStatus)
    status: BookingSlotStatus;

}