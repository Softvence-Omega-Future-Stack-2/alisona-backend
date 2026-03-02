import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class MakeBookingDto {
    @ApiProperty({ example: "Event Id" })
    @IsNotEmpty()
    @IsString()
    eventId: string;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    quentity: number;

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    @IsNumber()
    price: number;

    @ApiProperty({ example: "Mohammad Jihad" })
    @IsNotEmpty()
    @IsString()
    fullName: string;

    @ApiProperty({ example: "user@gmail.com" })
    @IsNotEmpty()
    @IsString()
    email: string;

    @ApiProperty({ example: "000122112212" })
    @IsNotEmpty()
    @IsString()
    phoneNumber: string;
}