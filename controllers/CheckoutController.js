const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//  Se for fzr gasto por mes tera 2 telas umas pros gastos gerais e outra tela pros gastos
// mensais. com 2 rotas uma /mes outra /total

class CheckoutController {
  async compraAprovada(req) {
    console.log(req);
  }
  async assinaturaCancelada(req, res) {}
  async assinaturaAtrasada(req, res) {}
  async assinaturaRenovada(req, res) {}
}

module.exports = new CheckoutController();
