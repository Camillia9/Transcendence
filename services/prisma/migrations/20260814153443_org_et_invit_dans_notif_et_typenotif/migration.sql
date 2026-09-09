/*
  Warnings:

  - The values [AjoutProjet] on the enum `TypeNotification` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
ALTER TYPE "InvitationStatus" ADD VALUE 'Cancelled';

-- AlterEnum
BEGIN;
CREATE TYPE "TypeNotification_new" AS ENUM ('Assignment', 'InvitationSent', 'InvitationAccepted', 'InvitationDeclined', 'InvitationCancelled', 'MemberLeftOrga', 'RoleChanged', 'RemovedFromOrga', 'MemberRemoved', 'OrgaUpdated', 'OrgaDeleted', 'ProjectUpdated', 'ProjectDeleted', 'RemovedFromProject', 'DeplacementTache');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "TypeNotification_new" USING ("type"::text::"TypeNotification_new");
ALTER TYPE "TypeNotification" RENAME TO "TypeNotification_old";
ALTER TYPE "TypeNotification_new" RENAME TO "TypeNotification";
DROP TYPE "public"."TypeNotification_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_projectId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_taskId_fkey";

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "invitationId" INTEGER,
ADD COLUMN     "organisationId" INTEGER;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "Invitation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
