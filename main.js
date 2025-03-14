const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

const App = require("./app.js");

require("dotenv").config({ path: ".env" });

const callAI = require("./ai/ai.js");

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: "./session", // Define um caminho para persistir a auth
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage", // Evita problemas de memória
      "--disable-gpu", // Importante para ambientes headless
      "--single-process", // Necessário para alguns ambientes Linux
    ],
  },
});

client.on("qr", (qr) => {
  console.log("QR Code Criado!");
  qrcode.generate(qr, { small: true });
  const link = `https://web.whatsapp.com/qr/${qr}`;
  console.log(link);
});

client.on("ready", () => {
  console.log(" ✅ Bot está pronto! ");
});

client.on("message", async (message) => {
  const chatId = message.from;
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  const msg = message.body.trim();

  try {
    await prisma.$transaction(async (prisma) => {
      const userExists = await prisma.user.findUnique({
        where: {
          user_id: hashId,
        },
      });

      if (!userExists) {
        const contato = await client.getContactById(chatId);
        const nome = contato.pushname || contato.name || "Nome Não disponível";

        newUser = await prisma.user.create({
          data: {
            user_id: hashId,
            name: nome,
            user_plan_id: 1,
          },
        });
      }
    });
  } catch (error) {
    console.log(error);
  }

  const response = await callAI({ message: msg, chatId, client });
  client.sendMessage(chatId, response);
});

App.listen(3000, "0.0.0.0", () => {
  console.log("Servidor Rodando na porta 3000");
});

client.initialize();
