const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");
const { mesParaNumeros } = require("./Ids.js");

async function gasto(partes, chatId, client, categoria, valor, categoria_id) {
  const descricao = partes.slice(0, -1).join(" ");
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  console.log("descrição:", descricao);

  if (isNaN(valor)) {
    client.sendMessage(chatId, "❌ O valor precisa ser um número!");
    return;
  }

  try {
    await prisma.$transaction(async (prisma) => {
      const lastGasto = await prisma.gasto.aggregate({
        where: { user_id: hashId },
        _max: {
          gasto_id: true,
        },
      });

      const nextId = (lastGasto._max.gasto_id || 0) + 1;

      const newGasto = await prisma.gasto.create({
        data: {
          valor: valor,
          descricao: descricao,
          user_id: hashId,
          categoria: categoria,
          categoria_id: categoria_id,
          gasto_id: nextId,
        },
      });

      client.sendMessage(
        chatId,
        `📌 *Gasto adicionado com sucesso!* \n\n` +
          `💵 *Valor:* R$${valor.toFixed(2)}\n` +
          `📂 *Categoria:* ${categoria}\n` +
          `📝 *Descrição:* ${descricao}\n` +
          `🆔 *ID do Gasto:* ${newGasto.gasto_id}\n\n` +
          `✅ Tudo certo! Seu gasto foi registrado.`
      );
    });
    return;
  } catch (error) {
    console.log(error);
    client.sendMessage(chatId, "⚠️ Ops, tente novamente em alguns segundos!");
    return;
  }
}

async function total(chatId, client, partes) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");

  if (partes == null) {
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
    const mes = mesParaNumeros(partes);
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

async function editar(partes, chatId, client) {
  const hashId = crypto.createHash("sha256").update(chatId).digest("hex");
  if (partes.length < 3) {
    client.sendMessage(
      chatId,
      "❌ Formato inválido! Use: ♻️ !update idGasto valor"
    );
    return;
  }

  const idGasto = parseInt(partes[1]);
  const valor = parseFloat(partes[2]);

  if (isNaN(idGasto) || isNaN(valor)) {
    client.sendMessage(chatId, "❌ O ID do gasto e o valor devem ser números!");
    return;
  }

  try {
    await prisma.gasto.update({
      where: {
        user_id_gasto_id: {
          user_id: hashId,
          gasto_id: idGasto,
        },
      },
      data: {
        valor: valor,
      },
    });

    client.sendMessage(
      chatId,
      `✅ Gasto atualizado com sucesso! Novo valor: R$${valor.toFixed(2)}`
    );
    return;
  } catch (error) {
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

module.exports = { gasto, total, editar, deletar };
