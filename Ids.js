function encontrarCategoriaId(categoria) {
  switch (categoria) {
    case "Alimentação":
      return 1;
    case "Transporte":
      return 2;
    case "Lazer":
      return 3;
    case "Saúde":
      return 4;
    case "Compras":
      return 5;
    case "Educação":
      return 6;
    case "Moradia":
      return 7;
    case "Outros":
      return 8;
  }
}

function normalizarTexto(texto) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function mesParaNumeros(mes) {
  const mesesMapeados = {
    janeiro: 1,
    jan: 1,
    fevereiro: 2,
    fev: 2,
    marco: 3,
    março: 3,
    mar: 3,
    abril: 4,
    abr: 4,
    maio: 5,
    junho: 6,
    jun: 6,
    julho: 7,
    jul: 7,
    agosto: 8,
    ago: 8,
    setembro: 9,
    set: 9,
    outubro: 10,
    out: 10,
    novembro: 11,
    nov: 11,
    dezembro: 12,
    dez: 12,
  };

  const mesNormalizado = normalizarTexto(mes);
  return mesesMapeados[mesNormalizado] || null;
}

function genereteColorByIndex(index) {
  // Defina o valor base hexadecimal #05845D
  const seed = (index * 12345 + 67890) % 256;

  // Gera valores aleatórios para R, G, e B, e aplica uma fórmula de modificação
  const r = (seed + Math.floor(Math.random() * 128) + index * 20) % 256;
  const g = (seed + Math.floor(Math.random() * 128) + index * 30) % 256;
  const b = (seed + Math.floor(Math.random() * 128) + index * 40) % 256;

  // Converte os valores RGB para hexadecimal
  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");

  // Retorna a cor gerada no formato hexadecimal
  return `#${hexR}${hexG}${hexB}`;
}

module.exports = { encontrarCategoriaId, mesParaNumeros, genereteColorByIndex };
