// Script para migrar dados de usuários do formato 'personal' para 'ameciclo_register'
// Execute com: node scripts/migrate-user-data.js

const admin = require('firebase-admin');
const path = require('path');

// Inicializar Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://ameciclistas-default-rtdb.firebaseio.com/"
});

const db = admin.database();

async function migrateUserData() {
  try {
    console.log('Iniciando migração de dados de usuários...');
    
    const usersRef = db.ref('subscribers');
    const snapshot = await usersRef.once('value');
    const users = snapshot.val();
    
    if (!users) {
      console.log('Nenhum usuário encontrado.');
      return;
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const [userId, userData] of Object.entries(users)) {
      // Verificar se o usuário tem dados em 'personal' mas não em 'ameciclo_register'
      if (userData.personal && !userData.ameciclo_register) {
        console.log(`Migrando usuário ${userId}...`);
        
        // Criar estrutura ameciclo_register baseada nos dados personal
        const amecicloRegister = {
          cpf: userData.personal.cpf,
          telefone: userData.personal.telefone,
          updated_at: userData.personal.updated_at || new Date().toISOString()
        };
        
        // Adicionar nome se disponível
        if (userData.name) {
          amecicloRegister.nome = userData.name;
        } else if (userData.telegram_user) {
          amecicloRegister.nome = `${userData.telegram_user.first_name} ${userData.telegram_user.last_name || ''}`.trim();
        }
        
        // Adicionar email se disponível
        if (userData.email) {
          amecicloRegister.email = userData.email;
        }
        
        // Atualizar o usuário no Firebase
        const userRef = db.ref(`subscribers/${userId}`);
        await userRef.update({
          ameciclo_register: amecicloRegister
        });
        
        // Remover dados antigos do 'personal' (opcional - descomente se quiser remover)
        // await userRef.child('personal').remove();
        
        migratedCount++;
        console.log(`✓ Usuário ${userId} migrado com sucesso`);
      } else if (userData.ameciclo_register) {
        console.log(`- Usuário ${userId} já possui ameciclo_register, pulando...`);
        skippedCount++;
      } else {
        console.log(`- Usuário ${userId} não possui dados personal para migrar, pulando...`);
        skippedCount++;
      }
    }
    
    console.log('\n=== Resumo da Migração ===');
    console.log(`Usuários migrados: ${migratedCount}`);
    console.log(`Usuários pulados: ${skippedCount}`);
    console.log('Migração concluída!');
    
  } catch (error) {
    console.error('Erro durante a migração:', error);
  } finally {
    process.exit(0);
  }
}

// Executar migração
migrateUserData();