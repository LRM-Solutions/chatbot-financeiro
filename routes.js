const { Router } = require("express");
const DataController = require("./controllers/DataController.js");
const CheckoutController = require("./controllers/CheckoutController.js");
const routes = Router();

routes.get("/", (req, res) => {
  return res.status(200).json({ ok: true });
});

routes.get("/gastos-mes/:chatId", DataController.GastoMes);
routes.get(
  "/gastos-mes-atual-lista/:chatId",
  DataController.GastoMesAtualLista
);

routes.get(
  "/gastos-total-mes-atual/:chatId",
  DataController.TotalGastosMesAtual
);
routes.get("/gastos-categoria/:chatId", DataController.GastosCategoria);

routes.post("/checkout-webhook", (req, res) => {
  console.log(req.body);

  switch (req.body.event) {
    case "SALE_APPROVED":
    // return CheckoutController.compraAprovada(req.body);
    // case "assinatura_cancelada":
    //   return CheckoutController.assinaturaCancelada(req, res);
    // case "assinatura_atrasada":
    //   return CheckoutController.assinaturaAtrasada(req, res);
    // case "assinatura_renovada":
    //   return CheckoutController.assinaturaRenovada(req, res);
    // default:
    //   return res.status(400).json({ error: "Status inválido" });
  }
});

module.exports = routes;
