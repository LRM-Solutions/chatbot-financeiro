const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DataController{
  async GastoMes(req,res){
    try{
      // HashId (ChatId) vai ser passado no body
      // Dps tem q fzr um jwt e autenticar c ele
      const { chatId, month } = req.body;

      if (!chatId || !month) {
        return res.status(400).json({ error: "Passe o chatId e o Mes" });
      }      

      const parsedMonth = Number(month);
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ error: "month must be a number between 1 and 12" });
      }

      const ano = new Date().getFullYear();
      const DataInicio = new Date(Date.UTC(ano, parsedMonth - 1, 1));
      const DataFim = new Date(Date.UTC(ano, parsedMonth, 1));
      
      const gastos = await prisma.gasto.findMany({
        where:{
          user_id: chatId,
          data:{
            gte: DataInicio,
            lt: DataFim
          }
        }
      });

      if(!gastos){
        return res.status(400).json({error:"nenhum gasto"});
      }

      return res.status(200).json(gastos);
    }catch(error){
      console.log(error);
      return res.status(400).json(error);
    }
  }
  async GastoCategoria(req,res){

  }
  async GastoMesAtual(req,res){

  }
}

module.exports = new DataController();
