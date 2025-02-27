const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
const encontrarCategoria = require("./categorias.js");
const { encontrarCategoriaId } = require("./Ids.js");
const { gasto, total, editar, deletar } = require("./functions.js");
const App = require("./app.js");
const { log } = require("console");
require("dotenv").config({ path: ".env.development" });

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
  const partes = msg.split(" ");
  const comando = partes[0].toLowerCase();

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
          },
        });
      }
    });
  } catch (error) {
    console.log(error);
  }

  switch (comando) {
    case "!total":
      // !total Março
      total(chatId, client, partes[1]);
      break;
    case "!editar":
      editar(partes, chatId, client);
      break;
    case "!deletar":
      deletar(partes, chatId, client);
      break;
    case "olá":
    case "ola":
    case "Ola":
    case "Olá":
      client.sendMessage(
        chatId,
        "🤖 Bem-vindo ao chatbot financeiro! Comandos disponíveis:\n" +
          "✅ *<Descrição> <Valor> (ex: Cinema 50)* - Registra um novo gasto.\n" +
          "📊 *!total* - Exibe o total de gastos do mês atual.\n" +
          "📊 *!total <mês>* - Exibe o total de gastos de um mês específico (ex: !total outubro).\n" +
          "♻️ *!editar idGasto valor* - Altera o valor de um gasto.\n" +
          "🗑️ *!deletar idGasto* - Remove um gasto.\n\n" +
          "📊 *!relatorio - Exibe um relatório dos seus gastos.\n" +
          "❓ Envie um desses comandos para interagir com o bot!"
      );
      break;
    case "!comandos":
      client.sendMessage(
        chatId,
        "🤖 Comandos disponíveis:\n" +
          "✅ *<Descrição> <Valor> (ex: Cinema 50)* - Registra um novo gasto.\n" +
          "📊 *!total* - Exibe o total de gastos do mês atual.\n" +
          "📊 *!total <mês>* - Exibe o total de gastos de um mês específico (ex: !total outubro).\n" +
          "♻️ *!editar idGasto valor* - Altera o valor de um gasto.\n" +
          "🗑️ *!deletar idGasto* - Remove um gasto.\n\n" +
          "📊 *!relatorio - Exibe um relatório dos seus gastos.\n" +
          "❓ Envie um desses comandos para interagir com o bot!"
      );
      break;
    case "!relatorio":
      client.sendMessage(
        chatId,
        "📊 Segue seu relatório de gastos:\n" +
          `http://dashboard-financeiai.lrmsolutions.com.br:8080/dashboard/${hashId}`
      );
      break;
    case "!":
      client.sendMessage(
        chatId,
        "⚠️ Ops! Parece que esse comando não existe ou foi digitado incorretamente.\n\n" +
          "💡 Para ver a lista completa de comandos disponíveis, digite: *!comandos*"
      );
      break;
    default:
      const regexGasto = /(.+?)\s+(\d+[\.,]?\d*)$/;
      const match = msg.match(regexGasto);

      if (match) {
        const descricao = match[1].trim();
        console.log("descriçãoS:", descricao);
        const valor = parseFloat(match[2].replace(",", "."));

        if (isNaN(valor)) {
          client.sendMessage(
            chatId,
            "❌ Valor inválido! Use: *Descrição Valor* (ex: Uber 25.50)"
          );
          return;
        }

        const categoria = encontrarCategoria(descricao);
        if (categoria) {
          //console.log("categoria:",categoria);
          const categoria_id = encontrarCategoriaId(categoria);
          gasto(partes, chatId, client, categoria, valor, categoria_id);
        }
      } else {
        client.sendMessage(
          chatId,
          `🤖 Não entendi! Para registrar um gasto, use:\n*<Descrição> <Valor>* (ex: Cinema 50)\n\nDigite *!comandos* para ver todas as opções.`
        );
      }
      break;
  }
});

App.listen(3000, "0.0.0.0", () => {
  console.log("Servidor Rodando na porta 3000");
});

client.initialize();
