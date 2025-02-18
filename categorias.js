const stringSimilarity = require("string-similarity");

const categorias = {
  "alimentação": [
  "comida", "coca","lanche", "almoço", "janta", "refeição", "pizza", "hamburguer", "sushi", "restaurante", "café", "sobremesa", "padaria", "fast food", "churrasco", "açai", "sorvete", "bebida", "refrigerante", "suco", "cerveja", "vinho", "whisky", "vodka", "água", "sanduíche", "hot dog", "pastel", "coxinha", "empada", "torta", "bolo", "chocolate", "balas", "doces", "pipoca", "batata frita", "esfiha", "pão", "queijo", "presunto", "manteiga", "leite", "iogurte", "cereal", "fruta", "salada", "arroz", "feijão", "macarrão", "carne", "frango", "peixe", "ovo", "pão de queijo", "tapioca", "crepe", "waffle", "panqueca", "brigadeiro", "beijinho", "pudim", "mousse", "milkshake", "sorveteria", "lanchonete", "food truck", "delivery", "ifood", "rappi", "uber eats"],
  "transporte": ["uber", "ônibus", "gasolina", "combustível", "passagem", "táxi", "metrô", "avião", "bilhete", "viagem", "carro", "moto", "pedágio", "estacionamento", "aluguel de carro", "transporte público"],
  "lazer": ["cinema", "show", "balada", "jogo", "cassino","entretenimento", "festival", "parque", "teatro", "museu", "zoológico", "aquário", "festa", "boate", "karaokê", "viagem", "passeio", "academia", "esporte", "futebol", "natação"],
  "saúde": ["remédio", "consulta", "médico", "hospital", "farmácia", "exame", "cirurgia", "dentista", "óculos", "plano de saúde", "vacina", "psicólogo", "fisioterapia", "acupuntura", "massagem"],
  "compras": ["pod","maconha","droga","pó","camiseta", "calça", "sapato", "tênis", "roupa", "vestido", "loja", "supermercado", "e-commerce", "mercado", "shopping", "eletrônico", "celular", "notebook", "livro", "presente", "decoração", "móveis", "cosméticos", "perfume"],
  "outros": []
};



const categoriasMapeadas = new Map();
for (const [categoria, palavras] of Object.entries(categorias)) {
  for (const palavra of palavras) {
    categoriasMapeadas.set(palavra.toLowerCase(), categoria);
  }
}

function normalizarTexto(texto) {
  return texto
    .normalize("NFD") // Remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function encontrarCategoria(descricao) {
  const descricaoNormalizada = normalizarTexto(descricao);

  const palavrasDescricao = descricaoNormalizada.split(/\s+/);

  for (const palavra of palavrasDescricao) {
    if (categoriasMapeadas.has(palavra)) {
      return categoriasMapeadas.get(palavra);
    }
  }

  const todasAsPalavras = Array.from(categoriasMapeadas.keys());
  const melhorCorrespondencia = stringSimilarity.findBestMatch(descricaoNormalizada, todasAsPalavras).bestMatch;
  if (melhorCorrespondencia.rating > 0.7) {
    return categoriasMapeadas.get(melhorCorrespondencia.target);
  }
  categorias["outros"].push(descricaoNormalizada);
  return "outros";
}

module.exports = encontrarCategoria;