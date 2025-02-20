/*
  Warnings:

  - Added the required column `categoria_id` to the `Gasto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Gasto" ADD COLUMN     "categoria_id" INTEGER NOT NULL;
