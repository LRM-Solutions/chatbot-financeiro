/*
  Warnings:

  - The primary key for the `Gasto` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_pkey",
ALTER COLUMN "gasto_id" DROP DEFAULT,
ADD CONSTRAINT "Gasto_pkey" PRIMARY KEY ("user_id", "gasto_id");
DROP SEQUENCE "Gasto_gasto_id_seq";
