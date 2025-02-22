const stringSimilarity = require("string-similarity");
const fs = require('fs');

const rawData = fs.readFileSync('categorias.json', 'utf8'); // Lê o arquivo como string
const categorias = JSON.parse(rawData);

const categoriasMapeadas = new Map();
for (const [categoria, palavras] of Object.entries(categorias)) {
  for (const palavra of palavras) {
    categoriasMapeadas.set(palavra.toLowerCase(), categoria);
  }
}
// ja tem uma dessa no ids.js
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
  if (melhorCorrespondencia.rating > 0.68){
    return categoriasMapeadas.get(melhorCorrespondencia.target);
  }
  
  if (!categorias["Outros"].includes(descricaoNormalizada)) {
    categorias["Outros"].push(descricaoNormalizada);
    
    fs.writeFileSync("categorias.json", JSON.stringify(categorias, null, 2), "utf8");
  
  }
  return "Outros";
}

module.exports = encontrarCategoria;