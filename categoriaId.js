
function encontrarCategoriaId(categoria){
  switch(categoria){
    case 'Alimentação':
      return 1
    case 'Transporte':
      return 2
    case 'Lazer':
      return 3
    case 'Saúde':
      return 4
    case 'Compras':
      return 5
    case 'Educação':
      return 6
    case 'Moradia':
      return 7
    case 'Outros':
      return 8
  }
}
module.exports = encontrarCategoriaId;