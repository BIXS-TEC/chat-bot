export function configureMenu(chatbot, productList, nightTime = { hour: 11, minute: 7 }, dayTime = { hour: 6, minute: 0 }) {
    
    // Calcular tempo até hora e minuto
    function calculateTimeUntil(hour, minute) {
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0, 0);
        
        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        return targetTime - now;
    }

    // Atualizar o cardapio com base no horario atual
    function updateMenu() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour > nightTime.hour || (hour === nightTime.hour && minute >= nightTime.minute) || 
            (hour < dayTime.hour || (hour === dayTime.hour && minute < dayTime.minute))) {
            chatbot.productList = productList[1];
            chatbot.createTopProductsCategory(chatbot.config.topProductsId[1]);
            console.log("Night menu activated");
        } else {
            chatbot.productList = productList[0];
            chatbot.createTopProductsCategory(chatbot.config.topProductsId[0]);
            console.log("Day menu activated");
        }
    }

    // Configurar os proximos timeouts
    function setupNextTimeout() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        let timeUntilNextSwitch;

        if (hour > nightTime.hour || (hour === nightTime.hour && minute >= nightTime.minute)) {
            timeUntilNextSwitch = calculateTimeUntil(dayTime.hour, dayTime.minute);
        } else if (hour < dayTime.hour || (hour === dayTime.hour && minute < dayTime.minute)) {
            timeUntilNextSwitch = calculateTimeUntil(dayTime.hour, dayTime.minute);
        } else {
            timeUntilNextSwitch = calculateTimeUntil(nightTime.hour, nightTime.minute);
        }

        setTimeout(() => {
            updateMenu();
            setupNextTimeout();
        }, timeUntilNextSwitch);
    }

    updateMenu();
    setupNextTimeout();
}
