/*
  Warnings:

  - Added the required column `email` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booking" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;
