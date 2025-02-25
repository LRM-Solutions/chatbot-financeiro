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

      const ano = new Date().getFullYear();
      const DataInicio = new Date(Date.UTC(ano, 0, 1));
      const DataFim = new Date(Date.UTC(ano + 1, 0, 0));
      const gastosTotal = await prisma.gasto.findMany({
        where: {
          user_id: chatId,
          data: {
            gte: DataInicio,
            lt: DataFim,
          },
        },
      });

      if (!gastosTotal) {
        return res.status(400).json({ error: "nenhum gasto" });
      }

      return res.status(200).json(gastosTotal);
    } catch (error) {
      console.log(error);
      return res.status(400).json(error);
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
