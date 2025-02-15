const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require("crypto");

async function gasto(partes, chatId, client){
  // !gasto valor descrição
  
  if(partes.length < 3){
    client.sendMessage(
      chatId,
      "❌ Formato inválido! Use: *!gasto valor descrição*"
    );
    return;
  }

  const valor = parseFloat(partes[1]);
  const descricao = partes.slice(2).join(" ");
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  if(isNaN(valor)){
    client.sendMessage(chatId, "❌ O valor precisa ser um número!");
    return;
  }
  try{
    const newGasto = await prisma.gasto.create({
      data:{
        valor:valor,
        descricao:descricao,
        user_id: hashId
      }
    });
    client.sendMessage(chatId,`✅ Gasto de R$${valor.toFixed(2)} adicionado!📝 ${descricao} com o id ${newGasto.gasto_id}`);
    return;
  }catch(error){
    client.sendMessage(chatId, "❌ Erro ao salvar o gasto!")
    return;
  }
}

async function total(chatId,client){
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  try{
    const gastos = await prisma.gasto.findMany({
      where:{
        user_id: hashId,
      }
    });
    
    const totalGastos = gastos.reduce((total, gasto) => total + gasto.valor, 0);
    
    client.sendMessage(chatId, `💰 Seu total de gastos é: R$${totalGastos.toFixed(2)}`);
    return;
  }catch(error){
    client.sendMessage(chatId, "❌ Ao somar os gastos!");
    return;
  }
}

async function editar(partes,chatId, client){
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  if (partes.length < 4) {
    client.sendMessage(chatId, "❌ Formato inválido! Use: ♻️ !update idGasto valor descrição");
    return;
  }

  const idGasto = parseInt(partes[1]);
  const valor = parseFloat(partes[2]);

  if (isNaN(idGasto) || isNaN(valor)) {
    client.sendMessage(chatId, "❌ O ID do gasto e o valor devem ser números!");
    return;
  }

  try{
    const atualizaGasto = await prisma.gasto.update({
      where:{
        gasto_id:idGasto,
        user_id: hashId
      },
      data:{
        valor:valor
      }
    });
    
    client.sendMessage(chatId, `✅ Gasto atualizado com sucesso! Novo valor: R$${valor.toFixed(2)}`);
    return;
  }catch(error){
    client.sendMessage(chatId, "❌ Erro ao editar o valor!");
    return;
  }
}

module.exports = { gasto, total, editar};