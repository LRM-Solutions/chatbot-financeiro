-- AlterTable
CREATE SEQUENCE pagamento_pagamento_id_seq;
ALTER TABLE "Pagamento" ALTER COLUMN "pagamento_id" SET DEFAULT nextval('pagamento_pagamento_id_seq');
ALTER SEQUENCE pagamento_pagamento_id_seq OWNED BY "Pagamento"."pagamento_id";
