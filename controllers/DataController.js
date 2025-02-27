const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { genereteColorByIndex } = require("../Ids.js");
//  Se for fzr gasto por mes tera 2 telas umas pros gastos gerais e outra tela pros gastos
// mensais. com 2 rotas uma /mes outra /total

class DataController {
  async GastoMes(req, res) {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return res.status(400).json({ error: "Passe o chatId" });
      }

      const hoje = new Date();
      const seisMesesAtras = new Date();
      seisMesesAtras.setMonth(hoje.getMonth() - 6);

      const gastos = await prisma.gasto.findMany({
        where: {
          user_id: chatId,
          data: {
            gte: seisMesesAtras,
            lte: hoje,
          },
        },
      });

      if (!gastos || gastos.length === 0) {
        return res.status(404).json({ error: "Nenhum gasto encontrado" });
      }

      const chartData = {
        labels: [],
        datasets: [
          {
            label: "Gastos por Mês",
            data: [],
            backgroundColor: [],
            hoverOffset: 4,
          },
        ],
      };

      const gastosAgrupadoMes = gastos.reduce((acc, gasto) => {
        const mesAno = gasto.data.toLocaleDateString("pt-BR", {
          year: "numeric",
          month: "long",
        });

        if (!acc[mesAno]) {
          acc[mesAno] = 0;
        }

        acc[mesAno] += gasto.valor;
        return acc;
      }, {});

      Object.entries(gastosAgrupadoMes).forEach(([mesAno, total], i) => {
        chartData.labels.push(mesAno);
        chartData.datasets[0].data.push(total);
        chartData.datasets[0].backgroundColor.push(genereteColorByIndex(i));
      });

      return res.status(200).json(chartData);
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar gastos", detalhes: error.message });
    }
  }

  async TotalGastosMesAtual(req, res) {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return res.status(400).json({ error: "Passe o chatId" });
      }

      const hoje = new Date();
      const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const gastos = await prisma.gasto.findMany({
        where: {
          user_id: chatId,
          data: {
            gte: primeiroDiaMes,
            lte: ultimoDiaMes,
          },
        },
      });

      if (!gastos || gastos.length === 0) {
        return res.status(404).json({ error: "Nenhum gasto encontrado" });
      }

      const totalGastos = gastos.reduce((acc, gasto) => acc + gasto.valor, 0);

      return res.status(200).json({ total: totalGastos });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Erro ao buscar gastos", detalhes: error.message });
    }
  }

  async GastosCategoria(req, res) {
    try {
      const { chatId } = req.params;

      if (!chatId) {
        return res.status(400).json({ error: "Passe o chatId" });
      }

      const gastos = await prisma.gasto.findMany({
        where: {
          user_id: chatId,
        },
      });

      if (!gastos) {
        return res.status(400).json();
      }

      const chartData = {
        labels: [],
        datasets: [
          {
            label: "Gastos por Categoria",
            data: [],
            backgroundColor: [],
            hoverOffset: 4,
          },
        ],
      };
      const gastosCategoriaAgrupado = gastos.reduce((acc, gasto) => {
        // Verificar se já existe uma categoria no acumulador
        const categoriaExistente = acc.find(
          (item) => item.label === gasto.categoria
        );

        if (categoriaExistente) {
          // Se já existe, somar o valor
          categoriaExistente.total += gasto.valor;
        } else {
          // Caso contrário, adicionar nova categoria
          acc.push({ label: gasto.categoria, total: gasto.valor });
        }

        return acc;
      }, []);

      gastosCategoriaAgrupado.forEach((item, i) => {
        chartData.labels.push(item.label);
        chartData.datasets[0].data.push(item.total);
        chartData.datasets[0].backgroundColor.push(genereteColorByIndex(i));
      });
      return res.status(200).json(chartData);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
    }
  }
}

module.exports = new DataController();
