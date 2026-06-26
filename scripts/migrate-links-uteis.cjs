const admin = require('firebase-admin');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
sa.private_key = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(sa),
    databaseURL: process.env.FIREBASE_DBURL
  });
}
const db = admin.database();
const now = new Date().toISOString();

const UPDATES = {
  // dados: url -> ameciclo.org/dados, add subdomain
  "-OmBt_8jPwhGTZoJna0Z": {
    icon: "📊",
    label: "Plataforma de Dados",
    url: "https://www.ameciclo.org/dados",
    subdomain: "dados",
    description: "Dados e estatísticas sobre mobilidade",
    updatedAt: now
  },
  // biciclopedia: url -> ameciclo.org/biciclopedia, subdomain -> faq
  "-OmBt_BaX8MA9deelQx9": {
    icon: "🚲",
    label: "Biciclopédia",
    url: "https://ameciclo.org/biciclopedia",
    subdomain: "faq",
    description: "FAQ, guias e documentação ciclística",
    updatedAt: now
  },
  // drive: add subdomain + real url
  "-OmBt_ETeI0oGQHQI6VV": {
    icon: "📁",
    label: "Drive da Ameciclo",
    url: "https://drive.google.com/drive/folders/0BxR5Ri6g5X_ZTTFzRU5zSWlxVFU?resourcekey=0-Y6sXMzhFDwv9BNePp-62ow&usp=drive_link",
    subdomain: "drive",
    description: "Documentos e arquivos compartilhados",
    requiredPermission: "AMECICLISTAS",
    categories: ["AMECICLISTAS"],
    updatedAt: now
  },
  // ocupe: add subdomain + real url
  "-OmBt_S5nIFyqLK1hcWr": {
    icon: "🏕️",
    label: "Ocupar a sede",
    url: "https://forms.gle/oKKfUNkNAubQqb4A7",
    subdomain: "ocupe",
    description: "Agendar uso da sede",
    updatedAt: now
  },
  // equipamento: url -> ameciclistas area
  "-OmBt_WViEiahrDFQOEK": {
    icon: "🔧",
    label: "Requisitar equipamento",
    url: "https://ameciclistas.ameciclo.org/registro-emprestimo",
    subdomain: "equipamento",
    description: "Solicitar equipamentos da Ameciclo",
    updatedAt: now
  },
  // internos: add subdomain + real calendar url
  "-OmBt_Zh15V3WJ8fvnBT": {
    icon: "📅",
    label: "Eventos Internos",
    url: "https://calendar.google.com/calendar/u/0?cid=YW1lY2ljbG9AZ21haWwuY29t",
    subdomain: "internos",
    description: "Calendário de eventos internos",
    requiredPermission: "ANY_USER",
    categories: ["PUBLICO", "AMECICLISTAS"],
    updatedAt: now
  },
  // externos: add subdomain + real calendar url
  "-OmBt_bv-2EsB5ePDDec": {
    icon: "🌍",
    label: "Eventos Externos",
    url: "https://calendar.google.com/calendar/u/0?cid=b2o0YmtndjFnNmNtY2J0c2FwNG9iZ2k5dmNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ",
    subdomain: "externos",
    description: "Eventos externos relacionados",
    requiredPermission: "ANY_USER",
    categories: ["PUBLICO", "AMECICLISTAS"],
    updatedAt: now
  },
  // organizacional: add subdomain + real calendar url
  "-OmBt_f5XbRlpD0gH_I_": {
    icon: "🗓️",
    label: "Organizacional",
    url: "https://calendar.google.com/calendar/u/0?cid=YW42bmg5NmF1ajluM2p0ajI4cW5vMWxpbWdAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ",
    subdomain: "organizacional",
    description: "Estrutura organizacional",
    updatedAt: now
  },
  // divulgacao: add subdomain + real calendar url
  "-OmBt_iJRPeq1iNhKvVQ": {
    icon: "📢",
    label: "Divulgação",
    url: "https://calendar.google.com/calendar/u/0?cid=b2o0YmtndjFnNmNtY2J0c2FwNG9iZ2k5dmNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ",
    subdomain: "divulgacao",
    description: "Divulgar eventos externos",
    requiredPermission: "ANY_USER",
    categories: ["PUBLICO", "AMECICLISTAS"],
    updatedAt: now
  }
};

const NEW_LINKS = [
  {
    label: "Atas",
    url: "https://drive.google.com/drive/folders/0BxR5Ri6g5X_ZflVLYTN0cUhsVkV4MzV3R1Z1MVo3Y0s1U1g4SWtFVG5tbWxzVXpnamo3bDA?resourcekey=0-G7b4eoWOG-hek4uoOlBhCg&usp=drive_link",
    icon: "📝",
    requiredPermission: "AMECICLISTAS",
    description: "Atas de reuniões e assembleias",
    order: 13,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "atas"
  },
  {
    label: "Biblioteca",
    url: "https://ameciclistas.ameciclo.org/biblioteca",
    icon: "📚",
    requiredPermission: "AMECICLISTAS",
    description: "Acervo da biblioteca comunitária",
    order: 14,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "biblioteca"
  },
  {
    label: "Documentação",
    url: "https://ameciclo.org/documentacao",
    icon: "📄",
    requiredPermission: "AMECICLISTAS",
    description: "Documentação institucional",
    order: 15,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "documentacao"
  },
  {
    label: "Estatuto",
    url: "https://drive.google.com/drive/u/0/search?q=estatuto%20type:pdf",
    icon: "⚖️",
    requiredPermission: "AMECICLISTAS",
    description: "Estatuto social da Ameciclo",
    order: 16,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "estatuto"
  },
  {
    label: "Grupos de Trabalho",
    url: "https://t.me/addlist/Fd6XMYf6tJs1Mjgx",
    icon: "👥",
    requiredPermission: "AMECICLISTAS",
    description: "Grupos de trabalho no Telegram",
    order: 17,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "gts"
  },
  {
    label: "Marca",
    url: "https://drive.google.com/file/d/1ogrW3lzNGv8_0qzG63THdodWXgO5yytL/view?usp=drive_link",
    icon: "🎨",
    requiredPermission: "AMECICLISTAS",
    description: "Manual da marca e identidade visual",
    order: 18,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "marca"
  },
  {
    label: "Participe",
    url: "https://ameciclo.org/participe",
    icon: "🙋",
    requiredPermission: "AMECICLISTAS",
    description: "Como participar da Ameciclo",
    order: 19,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "participe"
  },
  {
    label: "Projetos",
    url: "https://ameciclo.org/projetos",
    icon: "💡",
    requiredPermission: "AMECICLISTAS",
    description: "Projetos da Ameciclo",
    order: 20,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "projetos"
  },
  {
    label: "Recompensas",
    url: "https://forms.gle/2BaMd5ESiaMqaWV1A",
    icon: "🎁",
    requiredPermission: "AMECICLISTAS",
    description: "Programa de recompensas",
    order: 21,
    color: "#14b8a6",
    categories: ["PUBLICO", "AMECICLISTAS"],
    active: true,
    subdomain: "recompensas"
  }
];

async function migrate() {
  console.log('🚀 Iniciando migração de links úteis...\n');

  // 1. Atualizar existentes
  console.log('--- ATUALIZANDO LINKS EXISTENTES ---');
  for (const [id, data] of Object.entries(UPDATES)) {
    try {
      await db.ref(`links_uteis/${id}`).update(data);
      console.log(`✅ Atualizado: ${data.label || id}`);
    } catch (err) {
      console.error(`❌ Erro ao atualizar ${id}:`, err.message);
    }
  }

  // 2. Criar novos
  console.log('\n--- CRIANDO NOVOS LINKS ---');
  for (const link of NEW_LINKS) {
    try {
      const ref = db.ref('links_uteis').push();
      await ref.set({
        ...link,
        clicks: 0,
        createdAt: now,
        updatedAt: now
      });
      console.log(`✅ Criado: ${link.label} (ordem ${link.order})`);
    } catch (err) {
      console.error(`❌ Erro ao criar ${link.label}:`, err.message);
    }
  }

  console.log(`\n🎉 Migração concluída!`);
  process.exit(0);
}

migrate();
