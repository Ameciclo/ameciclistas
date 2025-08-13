// Script para popular o Firebase com produtos iniciais
// Execute com: node scripts/populate-products.js

const admin = require('firebase-admin');

// Inicializar Firebase Admin (você precisa configurar as credenciais)
// const serviceAccount = require('./path/to/serviceAccountKey.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: 'https://your-project.firebaseio.com'
// });

// Para este exemplo, vamos assumir que o Firebase já está configurado
const db = admin.database();

const initialProducts = {
  // Líquidos (Cervejas)
  'cerveja-lata': {
    id: 'cerveja-lata',
    name: 'Cerveja Lata',
    category: 'LIQUIDOS',
    price: 6.00,
    stock: 50,
    description: 'Cerveja em lata 350ml'
  },
  'cerveja-long-neck': {
    id: 'cerveja-long-neck',
    name: 'Cerveja Long Neck',
    category: 'LIQUIDOS',
    price: 6.00,
    stock: 30,
    description: 'Cerveja long neck 355ml'
  },

  // Camisas
  'camisa-ameciclo': {
    id: 'camisa-ameciclo',
    name: 'Camisa Ameciclo',
    category: 'CAMISAS',
    price: 25.00,
    stock: 0, // Controlado pelas variantes
    description: 'Camisa oficial da Ameciclo',
    variants: [
      { id: 'camisa-p-branca', name: 'P Branca', stock: 5, price: 25.00 },
      { id: 'camisa-m-branca', name: 'M Branca', stock: 8, price: 25.00 },
      { id: 'camisa-g-branca', name: 'G Branca', stock: 6, price: 25.00 },
      { id: 'camisa-p-preta', name: 'P Preta', stock: 3, price: 25.00 },
      { id: 'camisa-m-preta', name: 'M Preta', stock: 7, price: 25.00 },
      { id: 'camisa-g-preta', name: 'G Preta', stock: 4, price: 25.00 }
    ]
  },

  // Broches
  'broche-bike': {
    id: 'broche-bike',
    name: 'Broche Bicicleta',
    category: 'BROCHES',
    price: 5.00,
    stock: 20,
    description: 'Broche em formato de bicicleta'
  },
  'broche-capacete': {
    id: 'broche-capacete',
    name: 'Broche Capacete',
    category: 'BROCHES',
    price: 5.00,
    stock: 15,
    description: 'Broche em formato de capacete'
  },

  // Peças de Bicicleta
  'camara-aro-26': {
    id: 'camara-aro-26',
    name: 'Câmara de Ar Aro 26',
    category: 'PECAS_BICICLETA',
    price: 12.00,
    stock: 10,
    description: 'Câmara de ar para aro 26'
  },
  'kit-reparo': {
    id: 'kit-reparo',
    name: 'Kit Reparo',
    category: 'PECAS_BICICLETA',
    price: 8.00,
    stock: 15,
    description: 'Kit para reparo de câmara de ar'
  },

  // Livros
  'manual-ciclista': {
    id: 'manual-ciclista',
    name: 'Manual do Ciclista Urbano',
    category: 'LIVROS',
    price: 20.00,
    stock: 8,
    description: 'Guia completo para ciclismo urbano'
  },
  'kit-educativo': {
    id: 'kit-educativo',
    name: 'Kit Educativo Mobilidade',
    category: 'LIVROS',
    price: 35.00,
    stock: 5,
    description: 'Kit com materiais educativos sobre mobilidade urbana'
  },

  // Serviços
  'aluguel-paraciclo': {
    id: 'aluguel-paraciclo',
    name: 'Aluguel Paraciclo (diária)',
    category: 'SERVICOS',
    price: 15.00,
    stock: 999, // Serviços não têm estoque limitado
    description: 'Aluguel de paraciclo por dia'
  },
  'manutencao-basica': {
    id: 'manutencao-basica',
    name: 'Manutenção Básica',
    category: 'SERVICOS',
    price: 30.00,
    stock: 999,
    description: 'Serviço de manutenção básica de bicicleta'
  }
};

async function populateProducts() {
  try {
    console.log('Iniciando população de produtos...');
    
    const ref = db.ref('resources/products');
    await ref.set(initialProducts);
    
    console.log('Produtos populados com sucesso!');
    console.log(`Total de produtos: ${Object.keys(initialProducts).length}`);
    
    // Listar produtos por categoria
    const categories = {};
    Object.values(initialProducts).forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = 0;
      }
      categories[product.category]++;
    });
    
    console.log('\nProdutos por categoria:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`- ${category}: ${count} produtos`);
    });
    
  } catch (error) {
    console.error('Erro ao popular produtos:', error);
  }
}

// Descomente a linha abaixo para executar o script
// populateProducts();

module.exports = { initialProducts, populateProducts };