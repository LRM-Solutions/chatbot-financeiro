const { Router } = require("express");
const DataController = require("./controllers/DataController.js");
const routes = Router();

routes.get("/", (req,res)=>{
  return res.status(200).json({ ok : true});
});

routes.post("/mes", DataController.GastoMes);

module.exports = routes;