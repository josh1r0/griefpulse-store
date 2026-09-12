// ============================================================
// SHADOWLAND STORE
// ============================================================

const SERVER_IP = "shadowland.land";
const DONATEPAY_URL = "https://donatepay.ru/don/1531880";
const SHADOWLAND_WORKER_URL = "https://pay.shadowland.land";

const LAVA_CASES = {
    "3 кейса с донатом": {
        title: "3 DONATE CASES",
        route: "/lava/create-donatecase3",
        rub: 99,
        usd: 1.18
    },
    "10 кейсов с донатом": {
        title: "10 DONATE CASES",
        route: "/lava/create-donatecase10",
        rub: 279,
        usd: 3.32
    },
    "30 кейсов с донатом": {
        title: "30 DONATE CASES",
        route: "/lava/create-donatecase30",
        rub: 745,
        usd: 8.87
    },
    "1 кейс с коинами": {
        title: "1 COIN CASE",
        route: "/lava/create-coincase1",
        rub: 50,
        usd: 0.60
    },
    "3 кейса с коинами": {
        title: "3 COIN CASES",
        route: "/lava/create-coincase3",
        rub: 140,
        usd: 1.67
    },
    "5 кейсов с коинами": {
        title: "5 COIN CASES",
        route: "/lava/create-coincase5",
        rub: 220,
        usd: 2.62
    },
    "10 кейсов с коинами": {
        title: "10 COIN CASES",
        route: "/lava/create-coincase10",
        rub: 399,
        usd: 4.75
    },
    "8 кейсов с монетами": {
        title: "8 MONEY CASES",
        route: "/lava/create-moneycase8",
        rub: 50,
        usd: 0.60
    },
    "15 кейсов с монетами": {
        title: "15 MONEY CASES",
        route: "/lava/create-moneycase15",
        rub: 95,
        usd: 1.13
    },
    "40 кейсов с монетами": {
        title: "40 MONEY CASES",
        route: "/lava/create-moneycase40",
        rub: 220,
        usd: 2.62
    }
};

async function copyIP() {
    try {
        await navigator.clipboard.writeText(SERVER_IP);
        showMessage("IP скопирован: " + SERVER_IP);
    } catch (error) {
        showMessage("IP сервера: " + SERVER_IP);
    }
}

function buy(product, price) {
    const normalizedProduct = String(product || "").trim().toLowerCase();

    // Все кейсы — Lava.top.
    const caseConfig = LAVA_CASES[normalizedProduct];
    if (caseConfig) {
        buyCase(caseConfig);
        return;
    }

    if (normalizedProduct === "wither") {
        buyWither();
        return;
    }

    if (normalizedProduct === "legend") {
        buyLegend();
        return;
    }

    if (normalizedProduct === "imperator") {
        buyImperator();
        return;
    }

    if (normalizedProduct === "shadow") {
        buyShadow();
        return;
    }

    if (
        Number(price) === 50 &&
        (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))
    ) {
        buyCoins60();
        return;
    }

    if (
        Number(price) === 100 &&
        (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))
    ) {
        buyCoins140();
        return;
    }

    if (
        Number(price) === 469 &&
        (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))
    ) {
        buyCoins620();
        return;
    }

    if (
        Number(price) === 899 &&
        (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))
    ) {
        buyCoins1800();
        return;
    }

    if (
        Number(price) === 2499 &&
        (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))
    ) {
        buyCoins5000();
        return;
    }

    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_product", product);
    localStorage.setItem("shadowland_price", String(price));

    const confirmed = confirm(
        "Покупка: " + product +
        "\nMinecraft ник: " + nickname +
        "\nТочная сумма: " + price + " ₽" +
        "\n\nВАЖНО: на DonatePay введи ТОТ ЖЕ ник и ТОЧНО эту сумму. Не меняй сумму." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Открываем DonatePay...");

    setTimeout(() => {
        window.location.href = DONATEPAY_URL;
    }, 300);
}

// ============================================================
// WITHER — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyWither() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("WITHER");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(70, 0.83);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "Wither");
    localStorage.setItem("shadowland_price", "70");

    const confirmed = confirm(
        "Покупка: WITHER" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $0.83" : "Россия — 70 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату WITHER...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-wither",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            // Ниже покажем нормальную ошибку пользователю.
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava create invoice error:", data);
            showMessage("Не удалось создать оплату. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// LEGEND — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyLegend() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("LEGEND");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(140, 1.67);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "Legend");
    localStorage.setItem("shadowland_price", "140");

    const confirmed = confirm(
        "Покупка: LEGEND" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $1.67" : "Россия — 140 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату LEGEND...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-legend",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            // Ниже покажем нормальную ошибку пользователю.
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava LEGEND create invoice error:", data);
            showMessage("Не удалось создать оплату LEGEND. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava LEGEND network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// IMPERATOR — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyImperator() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("IMPERATOR");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(249, 2.96);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "Imperator");
    localStorage.setItem("shadowland_price", "249");

    const confirmed = confirm(
        "Покупка: IMPERATOR" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $2.96" : "Россия — 249 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату IMPERATOR...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-imperator",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
            // Ниже покажем нормальную ошибку пользователю.
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava IMPERATOR create invoice error:", data);
            showMessage("Не удалось создать оплату IMPERATOR. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava IMPERATOR network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// SHADOW — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyShadow() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("SHADOW");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(599, 7.13);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "Shadow");
    localStorage.setItem("shadowland_price", "599");

    const confirmed = confirm(
        "Покупка: SHADOW" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $7.13" : "Россия — 599 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату SHADOW...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-shadow",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava SHADOW create invoice error:", data);
            showMessage("Не удалось создать оплату SHADOW. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava SHADOW network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// 60 COINS — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyCoins60() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("60 COINS");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(50, 0.60);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "60 COINS");
    localStorage.setItem("shadowland_price", "50");

    const confirmed = confirm(
        "Покупка: 60 COINS" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $0.60" : "Россия — 50 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату 60 COINS...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-coins60",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava 60 COINS create invoice error:", data);
            showMessage("Не удалось создать оплату 60 COINS. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava 60 COINS network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// 140 COINS — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyCoins140() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("140 COINS");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(100, 1.19);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "140 COINS");
    localStorage.setItem("shadowland_price", "100");

    const confirmed = confirm(
        "Покупка: 140 COINS" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $1.19" : "Россия — 100 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату 140 COINS...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-coins140",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava 140 COINS create invoice error:", data);
            showMessage("Не удалось создать оплату 140 COINS. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava 140 COINS network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// 620 COINS — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyCoins620() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("620 COINS");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(469, 5.58);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "620 COINS");
    localStorage.setItem("shadowland_price", "469");

    const confirmed = confirm(
        "Покупка: 620 COINS" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $5.58" : "Россия — 469 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату 620 COINS...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-coins620",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava 620 COINS create invoice error:", data);
            showMessage("Не удалось создать оплату 620 COINS. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava 620 COINS network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// 1800 COINS — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyCoins1800() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("1800 COINS");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(899, 10.70);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "1800 COINS");
    localStorage.setItem("shadowland_price", "899");

    const confirmed = confirm(
        "Покупка: 1800 COINS" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $10.70" : "Россия — 899 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату 1800 COINS...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-coins1800",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava 1800 COINS create invoice error:", data);
            showMessage("Не удалось создать оплату 1800 COINS. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava 1800 COINS network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// 5000 COINS — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyCoins5000() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("5000 COINS");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(2499, 29.74);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "5000 COINS");
    localStorage.setItem("shadowland_price", "2499");

    const confirmed = confirm(
        "Покупка: 5000 COINS" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD" ? "Украина / другие страны — $29.74" : "Россия — 2499 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату 5000 COINS...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-coins5000",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava 5000 COINS create invoice error:", data);
            showMessage("Не удалось создать оплату 5000 COINS. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava 5000 COINS network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// КЕЙСЫ — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyCase(config) {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail(config.title);
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(config.rub, config.usd);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", config.title);
    localStorage.setItem("shadowland_price", String(config.rub));

    const usdText = Number(config.usd).toFixed(2);

    const confirmed = confirm(
        "Покупка: " + config.title +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (
            paymentCurrency === "USD"
                ? "Украина / другие страны — $" + usdText
                : "Россия — " + config.rub + " ₽"
        ) +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату " + config.title + "...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + config.route,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava CASE create invoice error:", data);
            showMessage("Не удалось создать оплату. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava CASE network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// 3 DONATE CASES — ОПЛАТА ЧЕРЕЗ LAVA.TOP
// ============================================================

async function buyDonateCase3() {
    const nicknameInput = document.getElementById("nickname");
    if (!nicknameInput) return;

    const nickname = nicknameInput.value.trim();

    if (!nickname) {
        nicknameInput.focus();
        showMessage("Сначала введи свой Minecraft ник!");
        return;
    }

    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput.focus();
        showMessage("Проверь Minecraft ник. Допустимо 3–16 символов.");
        return;
    }

    const email = await requestBuyerEmail("3 DONATE CASES");
    if (!email) return;

    const paymentCurrency = await requestPaymentCurrency(99, 1.18);
    if (!paymentCurrency) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "3 DONATE CASES");
    localStorage.setItem("shadowland_price", "99");

    const confirmed = confirm(
        "Покупка: 3 DONATE CASES" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nОплата: " + (paymentCurrency === "USD"
            ? "Украина / другие страны — $1.18"
            : "Россия — 99 ₽") +
        "\n\nПосле подтверждения откроется безопасная страница оплаты Lava.top." +
        "\n\nНажимая OK, ты подтверждаешь, что ознакомился с условиями покупки, возвратов и политикой конфиденциальности на shadowland.land/rules.html."
    );

    if (!confirmed) return;

    showMessage("Создаём оплату 3 DONATE CASES...");

    try {
        const response = await fetch(
            SHADOWLAND_WORKER_URL + "/lava/create-donatecase3",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nickname: nickname,
                    email: email,
                    currency: paymentCurrency
                })
            }
        );

        let data = null;

        try {
            data = await response.json();
        } catch (error) {
        }

        if (!response.ok || !data || data.ok !== true || !data.paymentUrl) {
            console.error("Lava 3 DONATE CASES create invoice error:", data);
            showMessage("Не удалось создать оплату 3 DONATE CASES. Попробуй ещё раз или напиши в поддержку.");
            return;
        }

        showMessage("Открываем Lava.top...");

        setTimeout(() => {
            window.location.href = data.paymentUrl;
        }, 250);

    } catch (error) {
        console.error("Lava 3 DONATE CASES network error:", error);
        showMessage("Не удалось подключиться к оплате Lava.top. Попробуй ещё раз.");
    }
}

// ============================================================
// ВЫБОР ВАЛЮТЫ ДЛЯ LAVA.TOP
// Россия -> RUB, Украина / другие страны -> USD
// ============================================================

function requestPaymentCurrency(rubPrice = 70, usdPrice = 0.83) {
    return new Promise(resolve => {
        const oldModal = document.querySelector(".shadowland-currency-modal");
        if (oldModal) oldModal.remove();

        const overlay = document.createElement("div");
        overlay.className = "shadowland-currency-modal";

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "100000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,.76)",
            backdropFilter: "blur(8px)"
        });

        const box = document.createElement("div");

        Object.assign(box.style, {
            width: "min(420px, 100%)",
            padding: "22px",
            borderRadius: "14px",
            border: "1px solid rgba(66,255,138,.20)",
            background: "#090d13",
            boxShadow: "0 25px 80px rgba(0,0,0,.55)",
            color: "#ffffff",
            fontFamily: '"Inter", Arial, sans-serif'
        });

        const title = document.createElement("div");
        title.textContent = "Выбери способ оплаты";

        Object.assign(title.style, {
            fontSize: "16px",
            fontWeight: "900",
            marginBottom: "8px"
        });

        const description = document.createElement("div");
        description.textContent = "Для России — рубли. Для Украины и других стран — доллары.";

        Object.assign(description.style, {
            color: "#7d8795",
            fontSize: "11px",
            lineHeight: "1.5",
            marginBottom: "15px"
        });

        const buttons = document.createElement("div");

        Object.assign(buttons.style, {
            display: "grid",
            gap: "10px"
        });

        const rubButton = document.createElement("button");
        rubButton.type = "button";
        rubButton.textContent = "🇷🇺 Россия — " + rubPrice + " ₽";

        const usdButton = document.createElement("button");
        usdButton.type = "button";
        usdButton.textContent = "🇺🇦 Украина / другие страны — $" + usdPrice;

        [rubButton, usdButton].forEach(button => {
            Object.assign(button.style, {
                width: "100%",
                height: "44px",
                border: "1px solid rgba(66,255,138,.22)",
                borderRadius: "9px",
                background: "#0d141c",
                color: "#ffffff",
                cursor: "pointer",
                fontSize: "11px",
                fontWeight: "900"
            });
        });

        usdButton.style.background = "#42ff8a";
        usdButton.style.color = "#031008";

        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "Отмена";

        Object.assign(cancel.style, {
            width: "100%",
            height: "40px",
            marginTop: "10px",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: "9px",
            background: "rgba(255,255,255,.04)",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "800"
        });

        const close = value => {
            overlay.remove();
            resolve(value);
        };

        rubButton.addEventListener("click", () => close("RUB"));
        usdButton.addEventListener("click", () => close("USD"));
        cancel.addEventListener("click", () => close(null));

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                close(null);
            }
        });

        buttons.append(rubButton, usdButton);
        box.append(title, description, buttons, cancel);
        overlay.appendChild(box);
        document.body.appendChild(overlay);
    });
}


// ============================================================
// E-MAIL ПОКУПАТЕЛЯ — ТЁМНОЕ ОКНО БЕЗ ИЗМЕНЕНИЯ STYLE.CSS
// ============================================================

function requestBuyerEmail(productName = "покупки") {
    return new Promise(resolve => {
        const oldModal = document.querySelector(".shadowland-email-modal");
        if (oldModal) oldModal.remove();

        const overlay = document.createElement("div");
        overlay.className = "shadowland-email-modal";

        Object.assign(overlay.style, {
            position: "fixed",
            inset: "0",
            zIndex: "100000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            background: "rgba(0,0,0,.76)",
            backdropFilter: "blur(8px)"
        });

        const box = document.createElement("div");

        Object.assign(box.style, {
            width: "min(420px, 100%)",
            padding: "22px",
            borderRadius: "14px",
            border: "1px solid rgba(66,255,138,.20)",
            background: "#090d13",
            boxShadow: "0 25px 80px rgba(0,0,0,.55)",
            color: "#ffffff",
            fontFamily: '"Inter", Arial, sans-serif'
        });

        const title = document.createElement("div");
        title.textContent = "E-mail для покупки " + productName;

        Object.assign(title.style, {
            fontSize: "16px",
            fontWeight: "900",
            marginBottom: "7px"
        });

        const description = document.createElement("div");
        description.textContent =
            "Укажи действующий e-mail. Он нужен Lava.top для оформления покупки и истории платежей.";

        Object.assign(description.style, {
            color: "#7d8795",
            fontSize: "11px",
            lineHeight: "1.5",
            marginBottom: "15px"
        });

        const input = document.createElement("input");
        input.type = "email";
        input.placeholder = "example@gmail.com";
        input.value = localStorage.getItem("shadowland_email") || "";
        input.autocomplete = "email";

        Object.assign(input.style, {
            width: "100%",
            height: "44px",
            padding: "0 13px",
            border: "1px solid rgba(255,255,255,.10)",
            borderRadius: "9px",
            outline: "none",
            background: "#05080c",
            color: "#ffffff",
            fontSize: "12px",
            fontWeight: "700",
            boxSizing: "border-box"
        });

        const errorText = document.createElement("div");
        errorText.textContent = "";

        Object.assign(errorText.style, {
            minHeight: "17px",
            marginTop: "6px",
            color: "#ff6b6b",
            fontSize: "10px",
            fontWeight: "700"
        });

        const buttons = document.createElement("div");

        Object.assign(buttons.style, {
            display: "flex",
            gap: "10px",
            marginTop: "8px"
        });

        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "Отмена";

        Object.assign(cancel.style, {
            flex: "1",
            height: "42px",
            border: "1px solid rgba(255,255,255,.09)",
            borderRadius: "9px",
            background: "rgba(255,255,255,.04)",
            color: "#ffffff",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "800"
        });

        const continueButton = document.createElement("button");
        continueButton.type = "button";
        continueButton.textContent = "Продолжить";

        Object.assign(continueButton.style, {
            flex: "1",
            height: "42px",
            border: "0",
            borderRadius: "9px",
            background: "#42ff8a",
            color: "#031008",
            cursor: "pointer",
            fontSize: "11px",
            fontWeight: "900"
        });

        const close = value => {
            document.removeEventListener("keydown", onKeyDown);
            overlay.remove();
            resolve(value);
        };

        const submit = () => {
            const email = input.value.trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                errorText.textContent = "Введи правильный e-mail.";
                input.style.borderColor = "rgba(255,90,90,.65)";
                input.focus();
                return;
            }

            close(email);
        };

        const onKeyDown = event => {
            if (event.key === "Escape") {
                close(null);
            }

            if (event.key === "Enter") {
                submit();
            }
        };

        cancel.addEventListener("click", () => close(null));
        continueButton.addEventListener("click", submit);

        overlay.addEventListener("click", event => {
            if (event.target === overlay) {
                close(null);
            }
        });

        document.addEventListener("keydown", onKeyDown);

        buttons.append(cancel, continueButton);
        box.append(title, description, input, errorText, buttons);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        setTimeout(() => input.focus(), 0);
    });
}

function showMessage(text) {
    const old = document.querySelector(".site-message");
    if (old) old.remove();

    const message = document.createElement("div");
    message.className = "site-message";
    message.textContent = text;

    Object.assign(message.style, {
        position: "fixed",
        left: "50%",
        bottom: "24px",
        transform: "translateX(-50%)",
        zIndex: "99999",
        maxWidth: "calc(100% - 30px)",
        padding: "12px 18px",
        borderRadius: "9px",
        background: "rgba(7,10,15,.97)",
        border: "1px solid rgba(66,255,138,.28)",
        boxShadow: "0 15px 45px rgba(0,0,0,.5)",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "800",
        textAlign: "center",
        transition: "opacity .25s"
    });

    document.body.appendChild(message);

    setTimeout(() => {
        message.style.opacity = "0";
        setTimeout(() => message.remove(), 260);
    }, 2800);
}

function setupNickname() {
    const input = document.getElementById("nickname");
    const wrapper = document.querySelector(".nickname-wrap");
    if (!input) return;

    const saved = localStorage.getItem("shadowland_nickname");

    if (saved && /^[A-Za-z0-9_]{3,16}$/.test(saved)) {
        input.value = saved;
    }

    function update() {
        input.value = input.value
            .replace(/[^A-Za-z0-9_]/g, "")
            .slice(0, 16);

        const valid = /^[A-Za-z0-9_]{3,16}$/.test(input.value);

        if (wrapper) {
            wrapper.classList.toggle("valid", valid);
        }

        if (valid) {
            localStorage.setItem("shadowland_nickname", input.value);
        }
    }

    input.addEventListener("input", update);
    update();
}

function setupReveal() {
    const elements = document.querySelectorAll(
        ".donate-card, .coin-card, .case-card, .advantages article, .section-heading, .player-card"
    );

    elements.forEach(element => element.classList.add("reveal"));

    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.08 }
    );

    elements.forEach(element => observer.observe(element));
}

function setupHeader() {
    const header = document.querySelector(".header");
    if (!header) return;

    function updateHeader() {
        header.style.background =
            window.scrollY > 20
                ? "rgba(3,5,8,.96)"
                : "rgba(3,5,8,.88)";
    }

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();
}

function fixInitialPosition() {
    if (window.location.hash === "#shop") {
        history.replaceState(null, "", window.location.pathname);
        window.scrollTo(0, 0);
    }
}

function showShopTab(tabId, button) {
    const tabs = ["donate-tab", "coins-tab", "cases-tab"];

    tabs.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === tabId ? "block" : "none";
        }
    });

    document.querySelectorAll(".shop-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fixInitialPosition();
    setupNickname();
    setupReveal();
    setupHeader();

    const donate = document.getElementById("donate-tab");
    const coins = document.getElementById("coins-tab");
    const cases = document.getElementById("cases-tab");

    if (donate) donate.style.display = "block";
    if (coins) coins.style.display = "none";
    if (cases) cases.style.display = "none";
});
