/*
  Warnings:

  - You are about to drop the column `email` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `expireAt` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `utilisee` on the `Invitation` table. All the data in the column will be lost.
  - Added the required column `invitedUserId` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('Pending', 'Accepted', 'Declined');

-- DropForeignKey
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_inviterId_fkey";

-- DropIndex
DROP INDEX "Invitation_token_key";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "email",
DROP COLUMN "expireAt",
DROP COLUMN "token",
DROP COLUMN "utilisee",
ADD COLUMN     "invitedUserId" INTEGER NOT NULL,
ADD COLUMN     "status" "InvitationStatus" NOT NULL DEFAULT 'Pending';

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
