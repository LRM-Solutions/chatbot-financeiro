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
  const baseColor = "#05845D";

  // Converte o valor hexadecimal para RGB
  const baseR = parseInt(baseColor.slice(1, 3), 16);
  const baseG = parseInt(baseColor.slice(3, 5), 16);
  const baseB = parseInt(baseColor.slice(5, 7), 16);

  // Modifique cada componente RGB com base no índice
  const r = (baseR + index * 10) % 256; // Ajusta o valor de R, garantindo que não ultrapasse 255
  const g = (baseG + index * 20) % 256; // Ajusta o valor de G, garantindo que não ultrapasse 255
  const b = (baseB + index * 15) % 256; // Ajusta o valor de B, garantindo que não ultrapasse 255

  // Converte os valores RGB de volta para hexadecimal
  const hexR = r.toString(16).padStart(2, "0");
  const hexG = g.toString(16).padStart(2, "0");
  const hexB = b.toString(16).padStart(2, "0");

  // Retorna a cor gerada no formato hexadecimal
  return `#${hexR}${hexG}${hexB}`;
}

module.exports = { encontrarCategoriaId, mesParaNumeros, genereteColorByIndex };
