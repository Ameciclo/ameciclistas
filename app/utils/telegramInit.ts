export default function telegramInit() {
    try {
        // Verifica se estamos no navegador
        if (typeof window === 'undefined') {
            return;
        }

        // Verifica se o WebApp do Telegram está disponível
        if (window.Telegram?.WebApp) {
            // Inicializa o Telegram Web App
            window.Telegram.WebApp.ready();

            // Log apenas se realmente estiver no Telegram
            if (window.Telegram.WebApp.platform !== 'unknown') {
                console.log("Plataforma:", window.Telegram.WebApp.platform);
                console.log("Dados do usuário:", window.Telegram.WebApp.initDataUnsafe);
            }
        } else {
            console.log("Executando em modo web (fora do Telegram)");
        }
    } catch (error) {
        console.error('Erro ao inicializar Telegram WebApp:', error);
    }
}