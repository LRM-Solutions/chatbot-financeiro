const { openai } = require("@ai-sdk/openai");
const { generateText, tool } = require("ai");
const { param } = require("../routes");
const { z } = require("zod");
const { adicionarGastos, getTotal, editar } = require("../functions.js");
const { encontrarCategoriaId } = require("../Ids.js");
const crypto = require("crypto");

const callAI = async ({ message, chatId, client }) => {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: `Você é um assistente financeiro responsavel por salvar os gastos das pessoas e montar seus relatorios de gastos tanto do mes quanto em uma timeline,
        para isso você deve ser capaz de entender comandos como:
        - Adicionar um gasto com uma descrição e um valor
        - Editar um gasto
        - Deletar um gasto
        - Mostrar o total de gastos do mês atual junto com a lista de gastos agrupados por categoria e também adicionar o link do dashboard
        - Mostrar o total de gastos de um mês específico junto com a lista de gastos agrupados por categoria e também adicionar o link do dashboard
         
        Suas respostas sempre que possiveis devem ser amigáveis, contendo emojis e formatada usando a formatação do whatsapp, evite usar #
      `,
    tools: {
      adicionarGastos: tool({
        parameters: z.object({
          items: z.array(
            z.object({
              descricao: z.string().describe("Descrição do gasto"),
              valor: z.number().describe("Valor do gasto"),
              categoria: z.string().describe(
                `Categoria do gasto - As categorias disponiveis são: Alimentação, Transporte, Lazer, Saúde, Compras, Educação, Moradia, Outros
              `
              ),
            })
          ),
        }),

        description: `Vai ser chamado quando alguém mandar um gasto, você irá adicionar um gasto para o usuário, você sempre tentará atribuir uma das categorias disponíveis para o gasto, caso não seja possível, você irá adicionar a categoria 'Outros'
        
          exemplo de retorno:
   

            💵 *Valor:* R$ valor do gasto
            📂 *Categoria: categoria do gasto*
            📝 *Descrição: descricao do gasto* 
            🆔 *ID do Gasto: id do gasto*

        

          `,
        execute: async ({ items }) => {
          console.log(JSON.stringify(items));

          //   const categoria_id = encontrarCategoriaId(categoria);
          //   const res = await gasto(
          //     descricao,
          //     chatId,
          //     client,
          //     categoria,
          //     valor,
          //     categoria_id
          //   );

          const res = await adicionarGastos(chatId, items);
          return res;
        },
      }),
      getTotal: tool({
        parameters: z.object({
          dataInicio: z
            .string()
            .describe(
              "Data de inicio para buscar os gastos, sempre deverá ser no primeiro minuto do dia, ex: 2022-10-31T00:00:00.000Z"
            ),
          dataFim: z
            .string()
            .describe(
              "Data de fim para buscar os gastos, sempre deverá ser no último minuto do dia, ex: 2022-10-31T23:59:59.999Z"
            ),
          categoria: z
            .string()
            .optional()
            .describe(
              "Categoria do gasto - As categorias disponiveis são: Alimentação, Transporte, Lazer, Saúde, Compras, Educação, Moradia, Outros"
            ),
        }),
        description: `Vai ser chamado quando o usuario solicitar o histórico ou o total de gastos dele, se o usuário não especificar o período, você deve retornar todos os gastos do mês atual como parametro, a data de hoje é ${new Date().toISOString()}

        Exemplo de resposta:

        📌 *Total de gastos  data inicio  - data fim*
        💵 R$ total gasto

        📂 *Categoria:* R$ total gasto com a categoria
                (lista de gastos com a categoria
                - gasto 1 - R$ Valor do gasto - ID do gasto - data do gasto

        📊 Para mais detalhes, você pode acessar seu dashboard de gastos: link do dashboard
        `,
        execute: async ({ dataInicio, dataFim, categoria }) => {
          const hashId = crypto
            .createHash("sha256")
            .update(chatId)
            .digest("hex");

          console.log({
            dataInicioStr: dataInicio,
            dataFimStr: dataFim,
            dataInicio: new Date(dataInicio),
            dataFim: new Date(dataFim),
            categoria,
            hashId,
          });

          const categoria_id = categoria
            ? encontrarCategoriaId(categoria)
            : undefined;

          const response = await getTotal(
            chatId,
            client,
            new Date(dataInicio),
            new Date(dataFim),
            categoria_id
          );

          console.log(response);

          return {
            ...response,
            dashboardLink: `http://dashboard-financeiai.lrmsolutions.com.br:8080/dashboard/${hashId}`,
          };
        },
      }),
      editarGasto: tool({
        parameters: z.object({
          // Id do gasto + Items
          items: z.array(
            z.object({
              descricao: z.string().describe("Descrição do Gasto!"),
              valor: z.number().describe("Valor do gasto"),
              categoria: z.string().describe(
                `Categoria do gasto - As categorias disponiveis são: Alimentação, Transporte, Lazer, Saúde, Compras, Educação, Moradia, Outros`
              ),
              idGasto: z.number().describe("Número que identifica o gasto a ser alterado!"),
            })
          ),
        }),

        description: `Vai ser chamado quando alguém quiser editar um ou mais gastos, você irá editar pelo id do gasto para o usuário, você sempre tentará atribuir uma das categorias disponíveis para o gasto, caso não seja possível, você irá adicionar a categoria 'Outros'
        
          exemplo de retorno:
   
            📌 *Gasto Editado com Sucesso*
            💵 *Valor:* R$ valor do gasto
            📂 *Categoria: categoria do gasto*
            📝 *Descrição: descricao do gasto* 
            🆔 *ID do Gasto: id do gasto*

          `,
        execute: async ({ items }) => {
          console.log(JSON.stringify(items));
          
          const res = await editar(chatId, items);
          return res;
        },
      }),
      
    },
    prompt: message,
    maxSteps: 5,
  });
  console.log(text);
  return text;
};

module.exports = callAI;
