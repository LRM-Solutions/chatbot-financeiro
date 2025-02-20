/*
  Warnings:

  - A unique constraint covering the columns `[user_id,gasto_id]` on the table `Gasto` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Gasto_user_id_gasto_id_key" ON "Gasto"("user_id", "gasto_id");
