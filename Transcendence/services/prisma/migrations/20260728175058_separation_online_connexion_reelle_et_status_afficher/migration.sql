/*
  Warnings:

  - The values [Online,Offline] on the enum `UserStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserStatus_new" AS ENUM ('Available', 'Away', 'Busy');
ALTER TABLE "public"."User" ALTER COLUMN "statut" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "statut" TYPE "UserStatus_new" USING ("statut"::text::"UserStatus_new");
ALTER TYPE "UserStatus" RENAME TO "UserStatus_old";
ALTER TYPE "UserStatus_new" RENAME TO "UserStatus";
DROP TYPE "public"."UserStatus_old";
ALTER TABLE "User" ALTER COLUMN "statut" SET DEFAULT 'Available';
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isOnline" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "statut" SET DEFAULT 'Available';
