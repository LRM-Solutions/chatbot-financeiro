const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

//  Se for fzr gasto por mes tera 2 telas umas pros gastos gerais e outra tela pros gastos
// mensais. com 2 rotas uma /mes outra /total

class CheckoutController {
  async compraAprovada(req) {
    /*

     |      created_at: '2025-03-14 16:48:13',
0|main  |   customer: {
0|main  |     name: 'João da Silva',
0|main  |     document: '23875090127',
0|main  |     email: 'exemplo@email.com',
0|main  |     phone_number: '5511987654321'
0|main  |   },
0|main  |   payment: {
0|main  |     method: 'CREDIT_CARD',
0|main  |     brand: 'visa',
0|main  |     installments: 1,
0|main  |     finished_at: '2025-03-14 16:48:28'
0|main  |   },

     */

    const { created_at, customer, payment } = req;

    let plan_id;

    const formatNumber = `+${customer.phone_number}@c.us`;
    const user = await prisma.user.findUnique({
      where: {
        phone_number: formatNumber,
      },
    });

    if (!user) {
      const newUser = await prisma.user.create({
        data: {
          name: customer.name,
          user_plan_id: plan_id,
        },
      });
    }
  }
  async assinaturaCancelada(req, res) {}
  async assinaturaAtrasada(req, res) {}
  async assinaturaRenovada(req, res) {}
}

module.exports = new CheckoutController();
