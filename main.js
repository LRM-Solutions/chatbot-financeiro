const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

const { gasto, total, editar} = require("./functions.js");


const client = new Client({
  authStrategy : new LocalAuth({
    dataPath: "./session" // Define um caminho para persistir a auth
  }),
  puppeteer:{
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox"
    ],
  }
});

client.on("qr",(qr)=>{
  console.log("QR Code Criado!");
  qrcode.generate(qr, {small:true});
});

client.on("ready",() =>{
  console.log(" ✅ Bot está pronto! ");
});

// Recebe uma mensagem e escreve no console

client.on('message', async  (message) => {
  const chatId = message.from;
  const msg = message.body.trim()
  const partes = msg.split(" ");
  const comando = partes[0].toLowerCase();

  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  const userExists = await prisma.user.findUnique({
    where:{
      user_id:hashId,
    },
  });

  if(!userExists){
    const contato = await client.getContactById(chatId);
    const nome = contato.pushname || contato.name || 'Nome Não disponível';

    newUser = await prisma.user.create({
      data:{
        user_id: hashId,
        name: nome
      }
    });
  }

  switch(comando){
    case "!gasto":
      // Chama a função gasto de functions.js
      gasto(partes, chatId, client);
      break;
    case "!total":
      total(chatId,client);
      break;
    case "!editar":
      editar(partes,chatId,client)
      break;
    case "!comandos":
      client.sendMessage(chatId,"🤖 Bem vindo ao chatbot financeiro! Comandos disponíveis:\n" +
        "✅ *!gasto valor descrição* - Registra um novo gasto.\n" +
        "📊 *!total* - Exibe o total de gastos do mês.\n" +
        "♻️ *!editar idGasto valor* - Altera um gasto \n\n" + 
        "❓ Envie um desses comandos para interagir com o bot!");
      break;
    default:
      //client.sendMessage(chatId,"🤖 Bem vindo ao chatbot financeiro!\n"+
        //"🤖 Digite !comandos para ver os comandos!");
      break;
  }
});

client.initialize();