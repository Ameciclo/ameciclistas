const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
serviceAccount.private_key = (process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n");

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DBURL
  });
}

const db = admin.database();

const linksUteis = [
  {
    label: "Site da Ameciclo",
    url: "https://ameciclo.org",
    icon: "🌐",
    requiredPermission: "ANY_USER",
    description: "Site oficial da Ameciclo",
    order: 1,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS", "AMECICLOBOT"],
    clicks: 0,
    active: true
  },
  {
    label: "Plataforma de Dados",
    url: "http://dados.ameciclo.org/",
    icon: "📈",
    requiredPermission: "ANY_USER",
    description: "Dados e estatísticas sobre mobilidade",
    order: 2,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Biciclopedia",
    url: "http://biciclopedia.ameciclo.org/",
    icon: "📚",
    requiredPermission: "ANY_USER",
    description: "Enciclopédia sobre ciclismo",
    order: 3,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Drive da Ameciclo",
    url: "http://drive.ameciclo.org/",
    icon: "🗂",
    requiredPermission: "AMECICLISTAS",
    description: "Documentos e arquivos compartilhados",
    order: 4,
    color: "#14b8a6",
    categories: ["AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Ver pautas para R.O",
    url: "http://pautas.ameciclo.org/",
    icon: "📄",
    requiredPermission: "AMECICLISTAS",
    description: "Pautas para reuniões ordinárias",
    order: 5,
    color: "#14b8a6",
    categories: ["AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Acompanhar nossos gastos",
    url: "http://transparencia.ameciclo.org/",
    icon: "📈",
    requiredPermission: "AMECICLISTAS",
    description: "Transparência financeira",
    order: 6,
    color: "#14b8a6",
    categories: ["AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Ocupar a sede",
    url: "http://ocupe.ameciclo.org/",
    icon: "🏠",
    requiredPermission: "AMECICLISTAS",
    description: "Agendar uso da sede",
    order: 7,
    color: "#14b8a6",
    categories: ["AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Requisitar equipamento",
    url: "http://equipamento.ameciclo.org/",
    icon: "🎥",
    requiredPermission: "AMECICLISTAS",
    description: "Solicitar equipamentos da Ameciclo",
    order: 8,
    color: "#14b8a6",
    categories: ["AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Eventos Internos",
    url: "http://internos.ameciclo.org/",
    icon: "📅",
    requiredPermission: "ANY_USER",
    description: "Calendário de eventos internos",
    order: 9,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Eventos Externos",
    url: "http://externos.ameciclo.org/",
    icon: "🌍",
    requiredPermission: "ANY_USER",
    description: "Eventos externos relacionados",
    order: 10,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Organizacional",
    url: "http://organizacional.ameciclo.org/",
    icon: "📋",
    requiredPermission: "AMECICLISTAS",
    description: "Estrutura organizacional",
    order: 11,
    color: "#14b8a6",
    categories: ["AMECICLISTAS"],
    clicks: 0,
    active: true
  },
  {
    label: "Divulgação de eventos externos",
    url: "http://divulgacao.ameciclo.org/",
    icon: "📢",
    requiredPermission: "ANY_USER",
    description: "Divulgar eventos externos",
    order: 12,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    clicks: 0,
    active: true
  }
];

async function populateLinksUteis() {
  try {
    console.log('🔗 Iniciando população de Links Úteis...');
    
    const linksRef = db.ref('links_uteis');
    
    for (const link of linksUteis) {
      const now = new Date().toISOString();
      const linkData = {
        ...link,
        createdAt: now,
        updatedAt: now
      };
      
      const newLinkRef = linksRef.push();
      await newLinkRef.set(linkData);
      console.log(`✅ Link adicionado: ${link.label} (ID: ${newLinkRef.key})`);
    }
    
    console.log(`\n🎉 ${linksUteis.length} links adicionados com sucesso!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular links:', error);
    process.exit(1);
  }
}

populateLinksUteis();
