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

            // Salvar userId no cookie para uso no servidor
            const user = window.Telegram.WebApp.initDataUnsafe?.user;
            if (user?.id) {
                document.cookie = `telegram_user_id=${user.id}; path=/; max-age=86400`;
            }

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