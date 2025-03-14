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

  console.log("chatId", chatId);
  console.log("hashId", hashId);

  const userExists = await prisma.user.findUnique({
    where: {
      user_id: hashId,
    },
  });

  if (!userExists) {
    client.sendMessage(
      chatId,
      "Você não está cadastrado em nosso sistema, por favor, se cadastre pelo link: https://financeai.lrmsolutions.com.br/"
    );
    return;
  }
  console.log("id do usuario verificado", userExists.user_id);

  const response = await callAI({ message: msg, chatId, client });
  client.sendMessage(chatId, response);
});

App.listen(3000, "0.0.0.0", () => {
  console.log("Servidor Rodando na porta 3000");
});

client.initialize();
