/*
  Warnings:

  - The values [PENDING] on the enum `DeliveryStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `receivedAt` on table `Delivery` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DeliveryStatus_new" AS ENUM ('RECEIVED', 'PICKED_UP');
ALTER TABLE "Delivery" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Delivery" ALTER COLUMN "status" TYPE "DeliveryStatus_new" USING ("status"::text::"DeliveryStatus_new");
ALTER TYPE "DeliveryStatus" RENAME TO "DeliveryStatus_old";
ALTER TYPE "DeliveryStatus_new" RENAME TO "DeliveryStatus";
DROP TYPE "DeliveryStatus_old";
ALTER TABLE "Delivery" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
COMMIT;

-- AlterTable
ALTER TABLE "Delivery" ADD COLUMN     "pickedUpAt" TIMESTAMP(3),
ALTER COLUMN "status" SET DEFAULT 'RECEIVED',
ALTER COLUMN "receivedAt" SET NOT NULL,
ALTER COLUMN "receivedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Host" ALTER COLUMN "phone" DROP NOT NULL;
