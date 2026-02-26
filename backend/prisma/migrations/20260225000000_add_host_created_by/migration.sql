-- AlterTable
ALTER TABLE "Host" ADD COLUMN "createdById" INTEGER;

-- CreateIndex
CREATE INDEX "Host_createdById_idx" ON "Host"("createdById");

-- AddForeignKey
ALTER TABLE "Host" ADD CONSTRAINT "Host_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
