const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode-terminal");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');

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
      let aguardandoResposta = false; 
      const message = `Escolha uma categoria para o gasto:\n
      1 - 🏥 Saúde\n
      2 - 🍔 Alimentação\n
      3 - 🚗 Transporte\n
      4 - 🎮 Lazer\n
      5 - 📦 Outro
      Responda com o número correspondente à categoria desejada.`;
      client.sendMessage(chatId, message);
      aguardandoResposta = true;

      client.on('message', async (msg) => {
        if (msg.from === chatId && aguardandoResposta) {
          const resposta = msg.body.trim();
          let categoria;
          switch (resposta) {
            case '1':
              categoria = 'Saúde';
              break;
            case '2':
              categoria = 'Alimentação';
              break;
            case '3':
              categoria = 'Transporte';
              break;
            case '4':
              categoria = 'Lazer';
              break;
            case '5':
              categoria = 'Outro';
              break;
            default:
              client.sendMessage(chatId, '❌ Opção inválida. Por favor, responda com um número de 1 a 5.');
              return; 
          }
          aguardandoResposta = false;
          gasto(partes, chatId, client, categoria);
        }
      });
      
      break;
    case "!total":
      total(chatId,client);
      break;
    case "!editar":
      editar(partes, chatId, client)
      break;
    case "!deletar":
      deletar(partes,chatId,client);
      break;
    case "ola":
    case "olá":
      client.sendMessage(chatId,"🤖 Bem vindo ao chatbot financeiro! Comandos disponíveis:\n" +
        "✅ *!gasto valor descrição* - Registra um novo gasto.\n" +
        "📊 *!total* - Exibe o total de gastos do mês.\n" +
        "♻️ *!editar idGasto valor* - Altera um gasto \n" + 
        "🗑️ *!deletar idGasto* - Remove um gasto.\n\n" +    
        "❓ Envie um desses comandos para interagir com o bot!");
        break;
    case "!comandos":
      client.sendMessage(chatId,"🤖 Comandos disponíveis:\n" +         
        "✅ *!gasto valor descrição* - Registra um novo gasto.\n" +         
        "📊 *!total* - Exibe o total de gastos do mês.\n" +         
        "♻️ *!editar idGasto valor* - Altera um gasto.\n" +  
        "🗑️ *!deletar idGasto* - Remove um gasto.\n\n" +        
        "❓ Envie um desses comandos para interagir com o bot!"
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
      break;
  }
});

client.initialize();