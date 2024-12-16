export default function telegramInit() {
    // Verifica se o WebApp do Telegram está disponível
    if (window.Telegram?.WebApp) {
        // Inicializa o Telegram Web App
        window.Telegram.WebApp.ready();

        // Exemplo: Configurações iniciais opcionais
        console.log("Plataforma:", window.Telegram.WebApp.platform);
        console.log("Dados do usuário:", window.Telegram.WebApp.initDataUnsafe);
        return
    } else {
        console.warn("Telegram WebApp SDK não está disponível.");
        return
    }
}