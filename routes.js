const { Router } = require("express");
const DataController = require("./controllers/DataController.js");
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
module.exports = routes;
