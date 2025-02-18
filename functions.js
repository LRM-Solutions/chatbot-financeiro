const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require("crypto");



async function gasto(partes, chatId, client, categoria,valor){
  const descricao = partes.filter(palavra => isNaN(palavra)).join(" ");
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  
  if(isNaN(valor)){
    client.sendMessage(chatId, "❌ O valor precisa ser um número!");
    return;
  }

  try{
  
    const lastGasto = await prisma.gasto.aggregate({
      where: { user_id: hashId },
      _max: {
        gasto_id: true
      }
    });

    const nextId = (lastGasto._max.gasto_id || 0) + 1;
    
    const newGasto = await prisma.gasto.create({
      data:{
        valor:valor,
        descricao:descricao,
        user_id: hashId,
        categoria: categoria, 
        gasto_id: nextId
      }
    });

    client.sendMessage(chatId,`✅ Gasto de R$${valor.toFixed(2)} adicionado!📝 ${descricao} com o id ${newGasto.gasto_id}`);
    return;
  
  }catch(error){
    console.log(error);
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

async function deletar(partes, chatId, client) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  if (partes.length < 2) {
    client.sendMessage(chatId, "❌ Formato inválido! Use: !deletar idGasto");
    return;
  }

  const idGasto = parseInt(partes[1]);

  if (isNaN(idGasto)) {
    client.sendMessage(chatId, "❌ O ID do gasto deve ser um número!");
    return;
  }

  try {
    await prisma.gasto.delete({
      where: {
        gasto_id: idGasto,
        user_id: hashId,
      },
    });

    client.sendMessage(chatId, "✅ Gasto deletado com sucesso!");
    return;
  } catch (error) {
    client.sendMessage(chatId, "❌ Erro ao deletar o valor!");
    return;
  }
}

module.exports = { gasto, total, editar, deletar};