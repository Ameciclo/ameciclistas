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

            // Exemplo: Configurações iniciais opcionais
            console.log("Plataforma:", window.Telegram.WebApp.platform);
            console.log("Dados do usuário:", window.Telegram.WebApp.initDataUnsafe);
        } else {
            console.warn("Telegram WebApp SDK não está disponível.");
        }
    } catch (error) {
        console.error('Erro ao inicializar Telegram WebApp:', error);
    }
}