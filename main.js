const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const encontrarCategoria = require("./categorias.js");
const { gasto, total, editar, deletar } = require("./functions.js");


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
    case "!total":
      total(chatId,client);
      break;
    case "!editar":
      editar(partes, chatId, client)
      break;
    case "!deletar":
      deletar(partes,chatId,client);
      break;
    case "olá":
    case "ola":
    case "Ola":
    case "Olá":
      client.sendMessage(chatId,"🤖 Bem vindo ao chatbot financeiro! Comandos disponíveis:\n" +
        "✅ *<Descrição> <Valor> (ex: Cinema 50)* - Registra um novo gasto.\n" +
        "📊 *!total* - Exibe o total de gastos do mês.\n" +
        "♻️ *!editar idGasto valor* - Altera um gasto \n" + 
        "🗑️ *!deletar idGasto* - Remove um gasto.\n\n" +    
        "❓ Envie um desses comandos para interagir com o bot!");
        break;
    case "!comandos":
      client.sendMessage(chatId,"🤖 Bem vindo ao chatbot financeiro! Comandos disponíveis:\n" +
        "✅ *<Descrição> <Valor> (ex: Cinema 50)* - Registra um novo gasto.\n" +
        "📊 *!total* - Exibe o total de gastos do mês.\n" +
        "♻️ *!editar idGasto valor* - Altera um gasto \n" + 
        "🗑️ *!deletar idGasto* - Remove um gasto.\n\n" +    
        "❓ Envie um desses comandos para interagir com o bot!");
        break;
    case "!":
      client.sendMessage(
        chatId,
        "⚠️ Ops! Parece que esse comando não existe ou foi digitado incorretamente.\n\n" +
        "💡 Para ver a lista completa de comandos disponíveis, digite: *!comandos*"
      );
      break;
    default:
      // Deepseek que fez 100% que dá pra fazer melhor
      const regexGasto = /(.+?)\s+(\d+[\.,]?\d*)$/;
      const match = msg.match(regexGasto);

      if (match) {
        const descricao = match[1].trim();
        const valor = parseFloat(match[2].replace(',', '.'));
        
        if (isNaN(valor)) {
          client.sendMessage(chatId, "❌ Valor inválido! Use: *Descrição Valor* (ex: Uber 25.50)");
          return;
        }

        const categoria = encontrarCategoria(descricao);
        if (categoria) {
          gasto(partes, chatId, client, categoria, valor);
        }
      } else {
        client.sendMessage(chatId, `🤖 Não entendi! Para registrar um gasto, use:\n*<Descrição> <Valor>* (ex: Cinema 50)\n\nDigite *!comandos* para ver todas as opções.`);
      }
      break;
  }
});

client.initialize();