-- CreateTable
CREATE TABLE "favourite" (
    "favouriteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "favourite_pkey" PRIMARY KEY ("favouriteId")
);

-- AddForeignKey
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourite" ADD CONSTRAINT "favourite_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;
