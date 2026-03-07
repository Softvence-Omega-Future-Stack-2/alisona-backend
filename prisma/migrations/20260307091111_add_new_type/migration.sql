-- CreateEnum
CREATE TYPE "BookingSlotStatus" AS ENUM ('NOT_CONFIRM', 'CONFIRM', 'REFUND');

-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "bookingConfarmStatus" "BookingSlotStatus" NOT NULL DEFAULT 'NOT_CONFIRM';
