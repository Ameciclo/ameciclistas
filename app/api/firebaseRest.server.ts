// Acesso direto ao Firebase Realtime Database via REST API
const DATABASE_URL = "https://botaprarodar-routes-default-rtdb.firebaseio.com";

export async function getBikesData() {
  try {
    const response = await fetch(`${DATABASE_URL}/bikes.json`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log('Dados recebidos do Firebase:', data);
    return data;
  } catch (error) {
    console.error('Erro ao buscar dados das bikes:', error);
    return null;
  }
}