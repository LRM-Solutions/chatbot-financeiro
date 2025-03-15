const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

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
    console.log(req);

    const { customer, payment, products } = req;

    let plan_id;
    switch (products[0].offer_name) {
      case "Plano Gratis":
        plan_id = 1;
        break;
      case "Plano Premium":
        plan_id = 2;
        break;
      case "Plano Premium +":
        plan_id = 3;
        break;
    }

    const formatNumber = `${customer.phone_number.replace(
      /^(\d{2})9/,
      "$1"
    )}@c.us`;
    console.log("phone number", customer.phone_number);

    console.log(formatNumber);

    const hashId = crypto
      .createHash("sha256")
      .update(formatNumber)
      .digest("hex");

    let user = await prisma.user.findUnique({
      where: {
        user_id: hashId,
      },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          user_id: hashId,
          name: customer.name,
          user_plan_id: plan_id,
        },
      });
    }

    await prisma.pagamento.create({
      data: {
        user_id: user.user_id,
      },
    });
  }
  async assinaturaCancelada(req, res) {}
  async assinaturaAtrasada(req, res) {}
  async assinaturaRenovada(req, res) {}
}

module.exports = new CheckoutController();
