/*
  Warnings:

  - The values [SuppProjet] on the enum `TypeNotification` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TypeNotification_new" AS ENUM ('Assignment', 'InvitationSent', 'InvitationAccepted', 'InvitationDeclined', 'InvitationCancelled', 'MemberLeftOrga', 'RoleChanged', 'RemovedFromOrga', 'ProjectUpdated', 'ProjectDeleted', 'AjoutProjet', 'DeplacementTache');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "TypeNotification_new" USING ("type"::text::"TypeNotification_new");
ALTER TYPE "TypeNotification" RENAME TO "TypeNotification_old";
ALTER TYPE "TypeNotification_new" RENAME TO "TypeNotification";
DROP TYPE "public"."TypeNotification_old";
COMMIT;
