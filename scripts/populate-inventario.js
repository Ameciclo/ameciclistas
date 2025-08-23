// Script para popular o inventário com itens de exemplo baseados na planilha fornecida
// Execute com: node scripts/populate-inventario.js

const admin = require('firebase-admin');

// Configuração do Firebase Admin (ajuste conforme necessário)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

const db = admin.database();

const itensInventario = [
  {
    codigo: "01",
    nome: "Oficina mecânica",
    categoria: "oficina mecânica",
    detalhamento: "https://docs.google.com/spreadsheets/d/1nTcURj_mEd45DnDiPbKdMLMQxQYCVQz4gEjSTTxkuzU/edit?usp=drive_link",
    disponivel: true
  },
  {
    codigo: "02.1",
    nome: "Materiais de captação",
    categoria: "caixotes",
    subcategoria: "materiais de captação",
    disponivel: true
  },
  {
    codigo: "02.4",
    nome: "Itens de festa",
    categoria: "caixotes",
    subcategoria: "itens de festa",
    disponivel: true
  },
  {
    codigo: "02.6",
    nome: "Materiais de ação direta",
    categoria: "caixotes",
    subcategoria: "materiais de ação direta",
    disponivel: true
  },
  {
    codigo: "02.7",
    nome: "Materiais de ação direta - vinis",
    categoria: "caixotes",
    subcategoria: "materiais de ação direta",
    detalhamento: "vinis",
    disponivel: true
  },
  {
    codigo: "02.8",
    nome: "Materiais de ação direta - faixas e tecidos",
    categoria: "caixotes",
    subcategoria: "materiais de ação direta",
    detalhamento: "faixas: o carro é se a rua é de todos, basta de mortes no trânsito, por uma vida menos ordinária vá de bike!, menos mortes 40km/h, Recife vai alagar de tanto carro, colapso climático atingido com sucesso, ultrapassei meta de poluição, eu mato e engarrafo, quanto espaço você ocupa? | tecidos: 05 tecidos em branco, tecido cetim vermelho | fôrmas de stencil",
    disponivel: true
  },
  {
    codigo: "02.10.1",
    nome: "Compressor ar direto arprex modelo 90",
    categoria: "caixotes",
    subcategoria: "equipamentos",
    disponivel: true
  },
  {
    codigo: "02.10.2",
    nome: "Fechadura extra",
    categoria: "caixotes",
    subcategoria: "equipamentos",
    disponivel: true
  },
  {
    codigo: "02.10.5",
    nome: "Compressor wind press wpjet",
    categoria: "caixotes",
    subcategoria: "equipamentos",
    disponivel: true
  },
  {
    codigo: "03.1",
    nome: "Armário administrativo",
    categoria: "mobiliário",
    disponivel: true
  },
  {
    codigo: "03.8",
    nome: "Mesa",
    categoria: "mobiliário",
    detalhamento: "tampo da mesa, plástico protetor, pé da mesa, extensões",
    disponivel: true
  },
  {
    codigo: "03.9.1",
    nome: "Cadeira acolchoada vermelha 1",
    categoria: "mobiliário",
    subcategoria: "cadeiras",
    disponivel: true
  },
  {
    codigo: "03.9.7",
    nome: "Cadeira plástica vinho 1",
    categoria: "mobiliário",
    subcategoria: "cadeiras",
    disponivel: true
  },
  {
    codigo: "03.9.13",
    nome: "Banco dobrável 1",
    categoria: "mobiliário",
    subcategoria: "cadeiras",
    disponivel: true
  },
  {
    codigo: "03.9.23",
    nome: "Cadeira de camping dobrável 1",
    categoria: "mobiliário",
    subcategoria: "cadeiras",
    disponivel: true
  },
  {
    codigo: "03.10.1",
    nome: "Escada dobrável 1 degrau",
    categoria: "mobiliário",
    subcategoria: "escadas",
    disponivel: true
  },
  {
    codigo: "03.10.2",
    nome: "Escada dobrável 12 degraus",
    categoria: "mobiliário",
    subcategoria: "escadas",
    disponivel: true
  },
  {
    codigo: "03.13.1",
    nome: "Quadro branco 1",
    categoria: "mobiliário",
    subcategoria: "quadros",
    disponivel: true
  },
  {
    codigo: "04.1",
    nome: "Impressora Epson L3250",
    categoria: "equipamentos eletrônicos",
    disponivel: true
  },
  {
    codigo: "04.2",
    nome: "Notebook Dell G15 5530 para projeto",
    categoria: "equipamentos eletrônicos",
    detalhamento: "carregador Dell, capa protetora Dell",
    disponivel: true
  },
  {
    codigo: "04.5",
    nome: "Câmera Canon R100 18x45",
    categoria: "equipamentos eletrônicos",
    detalhamento: "contém cartão de memória?",
    disponivel: true
  },
  {
    codigo: "04.6",
    nome: "Microfone lapela Boya Boyalink A2 Android/IOS 3.5mm",
    categoria: "equipamentos eletrônicos",
    disponivel: true
  },
  {
    codigo: "04.7",
    nome: "Carregador portátil (powerbank)",
    categoria: "equipamentos eletrônicos",
    disponivel: true
  },
  {
    codigo: "05.1.1",
    nome: "Ventilador de chão 1",
    categoria: "equipamentos elétricos",
    subcategoria: "ventiladores",
    detalhamento: "ventisol 6 pás",
    disponivel: true
  },
  {
    codigo: "05.2",
    nome: "Frigobar",
    categoria: "equipamentos elétricos",
    disponivel: true
  },
  {
    codigo: "05.3",
    nome: "Cafeteira",
    categoria: "equipamentos elétricos",
    disponivel: true
  },
  {
    codigo: "05.4",
    nome: "Micro-ondas",
    categoria: "equipamentos elétricos",
    disponivel: true
  },
  {
    codigo: "05.5.1",
    nome: "Caixa de som 1",
    categoria: "equipamentos elétricos",
    subcategoria: "caixas de som",
    disponivel: true
  },
  {
    codigo: "06.1",
    nome: "Caixas organizadoras",
    categoria: "equipamentos em geral",
    disponivel: true
  },
  {
    codigo: "06.2",
    nome: "Tripé",
    categoria: "equipamentos em geral",
    disponivel: true
  },
  {
    codigo: "06.3",
    nome: "Paraciclos",
    categoria: "equipamentos em geral",
    disponivel: true
  }
];

// Função para sanitizar códigos (substitui pontos por underscores)
function sanitizeFirebaseKey(key) {
  return key.replace(/\./g, '_');
}

async function popularInventario() {
  try {
    console.log('Iniciando população do inventário...');
    
    const ref = db.ref('inventario');
    
    for (const item of itensInventario) {
      const sanitizedKey = sanitizeFirebaseKey(item.codigo);
      await ref.child(sanitizedKey).set(item);
      console.log(`Item ${item.codigo} - ${item.nome} adicionado (chave: ${sanitizedKey})`);
    }
    
    console.log(`\n✅ ${itensInventario.length} itens adicionados ao inventário com sucesso!`);
    process.exit(0);
  } catch (error) {
    console.error('Erro ao popular inventário:', error);
    process.exit(1);
  }
}

popularInventario();