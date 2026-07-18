-- CreateTable
CREATE TABLE "breaks" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,

    CONSTRAINT "breaks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "breaks" ADD CONSTRAINT "breaks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
