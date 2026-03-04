import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsOptional,
    IsDateString,
    IsInt,
    Min,
    IsArray,
    ArrayNotEmpty,
    IsLatitude,
    IsLongitude,
    IsBoolean
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';
import { EventStatus, eventType } from '@prisma/client';

export class CreateEventDto {

    @ApiProperty({ example: 'Tech Conference 2026' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'TECH' })
    @IsString()
    category: string;

    @ApiProperty({ enum: eventType, example: eventType.PAID })
    @IsEnum(eventType)
    eventType: eventType;

    @ApiProperty({ example: 'This is a full stack development conference.' })
    @IsString()
    @IsNotEmpty()
    description: string;

    // Date & Time
    @ApiProperty({ example: '2026-05-20T00:00:00.000Z' })
    @IsDateString()
    eventDate: string;

    @ApiProperty({ example: '10:00' })
    @IsString()
    // @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    startTime: string;

    @ApiProperty({ example: '13:00', required: false })
    @IsString()
    @IsOptional()
    // @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    endTime?: string;

    @ApiProperty({ example: '3 hours', required: false })
    @IsOptional()
    @IsString()
    duration?: string;

    // Pricing & Capacity
    @ApiProperty({ example: 500 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    price: number;

    @ApiProperty({ example: 200 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    capacity: number;

    @ApiProperty({ example: 200, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    availableSeats?: number;

    // Location
    @ApiProperty({ example: 'Dhaka Convention Center' })
    @IsString()
    @IsNotEmpty()
    venueName: string;

    @ApiProperty({ example: 'Gulshan Avenue, Dhaka' })
    @IsString()
    @IsNotEmpty()
    address: string;

    @ApiProperty({ example: 'Dhaka' })
    @IsString()
    @IsNotEmpty()
    city: string;

    @ApiProperty({ example: true })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    isFamilyFriendly: boolean;

    @ApiProperty({ example: 23.8103 })
    @Type(() => Number)
    @IsLatitude()
    latitude: number;

    @ApiProperty({ example: 90.4125 })
    @Type(() => Number)
    @IsLongitude()
    longitude: number;

    // Sections
    @ApiProperty({ example: 'Learn advanced MERN stack development.' })
    @IsString()
    @IsNotEmpty()
    about: string;

    @ApiProperty({ example: 'Networking, live coding, Q&A session.' })
    @IsString()
    @IsNotEmpty()
    whatToExpect: string;

    @ApiProperty({ example: 'No refund after 24 hours.', required: false })
    @IsOptional()
    @IsString()
    cancellationPolicy?: string;

    @ApiProperty({ example: '18+', required: false })
    @IsOptional()
    @IsString()
    ageLimit?: string;

    // Highlights
    @ApiProperty({
        example: ['Networking Opportunity', 'Certificate Included'],
    })
    @Transform(({ value }) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return [value];
        return [];
    })
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    highlights: string[];

    @ApiProperty({ enum: EventStatus, example: EventStatus.ACTIVE })
    @IsEnum(EventStatus)
    status: EventStatus;
}