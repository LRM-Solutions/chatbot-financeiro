/*
  Warnings:

  - Added the required column `user_plan_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_plan_id" INTEGER;
UPDATE "User" SET "user_plan_id" = 1;
ALTER TABLE "User" ALTER COLUMN "user_plan_id" SET NOT NULL;

-- CreateTable
CREATE TABLE "Pagamento" (
    "pagamento_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pagamento_pkey" PRIMARY KEY ("pagamento_id")
);

-- AddForeignKey
ALTER TABLE "Pagamento" ADD CONSTRAINT "Pagamento_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
