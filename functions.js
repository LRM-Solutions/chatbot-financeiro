const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
const { mesParaNumeros } = require("./Ids.js");
const { encontrarCategoriaId } = require("./Ids.js");

async function gasto(
  descricao,
  chatId,
  client,
  categoria,
  valor,
  categoria_id
) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  console.log("descrição:", descricao);

  try {
    let newGasto;

    await prisma.$transaction(async (prisma) => {
      const lastGasto = await prisma.gasto.aggregate({
        where: { user_id: hashId },
        _max: {
          gasto_id: true,
        },
      });

      const nextId = (lastGasto._max.gasto_id || 0) + 1;

      newGasto = await prisma.gasto.create({
        data: {
          valor: valor,
          descricao: descricao,
          user_id: hashId,
          categoria: categoria,
          categoria_id: categoria_id,
          gasto_id: nextId,
        },
      });
    });
    return newGasto;
  } catch (error) {
    console.log(error);
    client.sendMessage(chatId, "⚠️ Ops, tente novamente em alguns segundos!");
    return;
  }
}

async function adicionarGastos(chatId, items) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  try {
    let gastos = [];

    await prisma.$transaction(async (prisma) => {
      const lastGasto = await prisma.gasto.aggregate({
        where: { user_id: hashId },
        _max: {
          gasto_id: true,
        },
      });

      const nextId = (lastGasto._max.gasto_id || 0) + 1;

      gastos = await Promise.all(
        items.map(async (item, index) => {
          const { valor, descricao, categoria } = item;

          const categoriaId = encontrarCategoriaId(categoria); // <- Import a merda da funçao aqui

          const generatedItem = await prisma.gasto.create({
            data: {
              valor: valor,
              descricao: descricao,
              user_id: hashId,
              categoria: categoria,
              categoria_id: categoriaId,
              gasto_id: nextId + index,
            },
          });

          return generatedItem;
        })
      );
    });

    return gastos;
  } catch (err) {
    console.log("Error: ", err);
    return {
      error: true,
      errorMessage: "Ops, tente novamente em alguns segundos!",
    };
  }
}

async function getTotal(chatId, client, dataInicio, dataFim, categoria_id) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  let data = dataInicio && dataFim ? { gte: dataInicio, lt: dataFim } : {};

  const gastos = await prisma.gasto.findMany({
    where: {
      user_id: hashId,
      data,
      categoria_id,
    },
  });

  const totalGastos = gastos.reduce((total, gasto) => total + gasto.valor, 0);
  // let listaGastos = gastos
  //   .map(
  //     (gasto, index) =>
  //       `${index + 1} - ${gasto.descricao} R$${gasto.valor.toFixed(2)} - ID: ${
  //         gasto.gasto_id
  //       }`
  //   )
  //   .join("\n");
  // // client.sendMessage(
  // //   chatId,
  // //   `💰 Seu total de gastos é: R$${totalGastos.toFixed(2)}\n\n${listaGastos}`
  // // );
  return { totalGastos, gastos };
}

async function total(chatId, client, mes) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  if (mes == null) {
    try {
      const gastos = await prisma.gasto.findMany({
        where: {
          user_id: hashId,
        },
      });

      const totalGastos = gastos.reduce(
        (total, gasto) => total + gasto.valor,
        0
      );
      let listaGastos = gastos
        .map(
          (gasto, index) =>
            `${index + 1} - ${gasto.descricao} R$${gasto.valor.toFixed(
              2
            )} - ID: ${gasto.gasto_id}`
        )
        .join("\n");
      client.sendMessage(
        chatId,
        `💰 Seu total de gastos é: R$${totalGastos.toFixed(
          2
        )}\n\n${listaGastos}`
      );
      return;
    } catch (error) {
      console.log(error);
      client.sendMessage(chatId, "Erro!");
      return;
    }
  } else {
    const mes = mesParaNumeros(mes);
    console.log("mes:", mes);
    const ano = new Date().getFullYear();
    const DataInicio = new Date(Date.UTC(ano, mes - 1, 1));
    const DataFim = new Date(Date.UTC(ano, mes, 0));

    try {
      const gastos = await prisma.gasto.findMany({
        where: {
          user_id: hashId,
          data: {
            gte: DataInicio,
            lt: DataFim,
          },
        },
      });
      const totalGastos = gastos.reduce(
        (total, gasto) => total + gasto.valor,
        0
      );
      let listaGastos = gastos
        .map(
          (gasto, index) =>
            `${index + 1} - ${gasto.descricao} R$${gasto.valor.toFixed(2)}`
        )
        .join("\n");
      client.sendMessage(
        chatId,
        `💰 Seu total de gastos é: R$${totalGastos.toFixed(
          2
        )}\n\n${listaGastos}`
      );
      return;
    } catch (error) {
      client.sendMessage(chatId, "❌ Ao somar os gastos!");
      return;
    }
  }
}

async function editar(chatId, items) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  try{
    let gastos = [];

    await prisma.$transaction(async(prisma)=>{
      gastos = await Promise.all(
        items.map(async (item,index)=>{
          const { valor, descricao, categoria, idGasto } = item;

          const categoriaId = encontrarCategoriaId(categoria);

          const editedItem = await prisma.gasto.update({
            data: {
              valor: valor,
              descricao: descricao,
              categoria: categoria,
              categoria_id: categoriaId,
            },
            where:{
              gasto_id: idGasto,
              user_id: hashId,
            },
          });

          return editedItem;
          })
        );
      });

      return gastos;
  }catch(err){
    console.log("Error: ", err);
    return {
      error: true,
      errorMessage: "Ops, tente novamente em alguns segundos!",
    };
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
        user_id_gasto_id: {
          user_id: hashId,
          gasto_id: idGasto,
        },
      },
    });

    client.sendMessage(chatId, "✅ Gasto deletado com sucesso!");
    return;
  } catch (error) {
    client.sendMessage(chatId, "❌ Erro ao deletar o valor!");
    return;
  }
}

module.exports = { gasto, total, editar, deletar, getTotal, adicionarGastos };
