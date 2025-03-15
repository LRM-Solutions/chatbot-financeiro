const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

class CheckoutController {
  async compraAprovada(req) {
    console.log(req);

    const { customer, products } = req;

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

    let formatNumber;

    if (customer.phone_number.length === 13) {
      formatNumber = `${
        customer.phone_number.split("").slice(0, 4).join("") +
        customer.phone_number.split("").slice(5).join("")
      }@c.us`;
    } else {
      formatNumber = `${customer.phone_number}@c.us`;
    }

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
