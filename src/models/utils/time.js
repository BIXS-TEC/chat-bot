const nightTime = { hour: 14, minute: 2 }; // Exemplo: 14:00 (2 PM)
const dayTime = { hour: 6, minute: 0 }; // Exemplo: 06:00 (6 AM)

export function configureMenu(productList, nightTime, dayTime) {
    let currentProductList;
    
    // Function to calculate the time until a specific hour and minute
    function calculateTimeUntil(hour, minute) {
        const now = new Date();
        const targetTime = new Date();
        targetTime.setHours(hour, minute, 0, 0);
        
        // If the target time has already passed today, schedule for the next day
        if (targetTime <= now) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        
        return targetTime - now;
    }

    // Function to update the menu based on the current time
    function updateMenu() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        if (hour > nightTime.hour || (hour === nightTime.hour && minute >= nightTime.minute) || 
            (hour < dayTime.hour || (hour === dayTime.hour && minute < dayTime.minute))) {
            currentProductList = productList.night;
            console.log("Night menu activated:", currentProductList);
        } else {
            currentProductList = productList.day;
            console.log("Day menu activated:", currentProductList);
        }
    }

    // Function to set up the next timeouts
    function setupNextTimeout() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();

        let timeUntilNextSwitch;

        if (hour > nightTime.hour || (hour === nightTime.hour && minute >= nightTime.minute)) {
            // After the nightTime, calculate the time until the dayTime the next day
            timeUntilNextSwitch = calculateTimeUntil(dayTime.hour, dayTime.minute);
        } else if (hour < dayTime.hour || (hour === dayTime.hour && minute < dayTime.minute)) {
            // Before the dayTime, calculate the time until the dayTime today
            timeUntilNextSwitch = calculateTimeUntil(dayTime.hour, dayTime.minute);
        } else {
            // Between the dayTime and nightTime, calculate the time until the nightTime today
            timeUntilNextSwitch = calculateTimeUntil(nightTime.hour, nightTime.minute);
        }

        setTimeout(() => {
            updateMenu();
            setupNextTimeout();
        }, timeUntilNextSwitch);
    }

    // Initialize the menu and set up the first timeout
    updateMenu();
    setupNextTimeout();
}
