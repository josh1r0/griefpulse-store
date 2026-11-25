// ============================================================
// SHADOWLAND STORE
// ============================================================

const SERVER_IP = "shadowland.land";
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
    const numericPrice = Number(price);

    // Товар остаётся на сайте. Lava.top не принимает оплату дешевле 50 ₽.
    if (numericPrice < 50) {
        showMessage("⛔ Минимальная сумма оплаты — 50 ₽. Этот товар стоит " + numericPrice + " ₽, поэтому отдельно оплатить его через Lava.top нельзя. Выбери товар от 50 ₽.");
        return;
    }

    const caseConfig = LAVA_CASES[normalizedProduct];
    if (caseConfig) {
        buyCase(caseConfig);
        return;
    }

    if (STORE_RANKS[normalizedProduct]) { buyRank(normalizedProduct); return; }
    // SILVER cannot be purchased separately while Lava.top requires a 50 ₽ minimum.
    if (normalizedProduct === "silver") {
        showMessage("SILVER стоит 25 ₽ — пока недоступен для отдельной оплаты через Lava.top.");
        return;
    }

    if (numericPrice === 50 && (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))) {
        buyCoins60(); return;
    }
    if (numericPrice === 100 && (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))) {
        buyCoins140(); return;
    }
    if (numericPrice === 469 && (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))) {
        buyCoins620(); return;
    }
    if (numericPrice === 899 && (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))) {
        buyCoins1800(); return;
    }
    if (numericPrice === 2499 && (normalizedProduct.includes("коин") || normalizedProduct.includes("coin"))) {
        buyCoins5000(); return;
    }

    showMessage("Этот товар пока нельзя оплатить автоматически. Напиши в поддержку ShadowLand.");
}


// ============================================================
// SHADOWLAND — SINGLE RANK CHECKOUT
// Only ranks whose displayed prices match configured Worker prices.
// ============================================================
const STORE_RANKS = Object.freeze({
    wither: Object.freeze({ name: "WITHER", rub: 50, usd: 0.83, path: "/lava/create-wither" }),
    reaper: Object.freeze({ name: "REAPER", rub: 75, usd: 0.92, path: "/lava/create-reaper" }),
    titan: Object.freeze({ name: "TITAN", rub: 110, usd: 1.34, path: "/lava/create-titan" }),
    legend: Object.freeze({ name: "LEGEND", rub: 140, usd: 1.65, path: "/lava/create-legend" }),
    overlord: Object.freeze({ name: "OVERLORD", rub: 199, usd: 2.43, path: "/lava/create-overlord" }),
    imperator: Object.freeze({ name: "IMPERATOR", rub: 349, usd: 2.94, path: "/lava/create-imperator" }),
    shadow: Object.freeze({ name: "SHADOW", rub: 599, usd: 7.07, path: "/lava/create-shadow" })
});

let rankCheckoutInProgress = false;

function shopRecipientError(code) {
    if(code==="player_not_registered") return "Игрок с таким ником ещё не зарегистрирован на сервере. Проверь ник.";
    if(code==="shop_registry_unavailable"||code==="rank_not_verified"||code==="duel_rank_not_verified") return "Проверка данных игроков временно недоступна. Повтори позже.";
    if(code==="grief_rank_not_purchasable") return "Текущая привилегия не входит в обычную линейку донатов. Обратись в поддержку.";
    return "Не удалось проверить игрока. Повтори позже.";
}
async function checkShopRecipient(nickname) {
    try {
        const response=await fetch(SHADOWLAND_WORKER_URL+"/shop/player-check?"+new URLSearchParams({nickname}),{cache:"no-store"});
        const data=await response.json();
        if(response.ok&&data.ok===true&&String(data.nickname).toLowerCase()===nickname.toLowerCase())return true;
        showMessage(shopRecipientError(data.error));return false;
    }catch{showMessage("Проверка данных игроков временно недоступна. Повтори позже.");return false;}
}

async function buyRankFullPrice(rank) {
    const rankKey = String(rank || "").toLowerCase();
    const item = STORE_RANKS[rankKey];
    if (!item) {
        showMessage("Покупка этого ранга временно недоступна.");
        return;
    }
    if (rankCheckoutInProgress) return;

    const nicknameInput = document.getElementById("nickname");
    const nickname = nicknameInput?.value.trim() || "";
    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput?.focus();
        showMessage("Сначала укажи Minecraft-ник (3–16 символов) вверху магазина.");
        return;
    }

    if (!await checkShopRecipient(nickname)) return;
    const email = await requestBuyerEmail(item.name);
    if (!email) return;

    const currency = await requestPaymentCurrency(item.rub, item.usd);
    if (!currency) return;

    const cost = currency === "USD" ? "$" + item.usd.toFixed(2) : item.rub + " ₽";
    if (!confirm("Привилегия: " + item.name +
        "\nMinecraft-ник: " + nickname +
        "\nE-mail: " + email +
        "\nСтоимость: " + cost +
        "\n\nПроверь данные. Продолжая, ты соглашаешься с условиями покупки на shadowland.land/rules.html." +
        "\n\nОткрыть страницу оплаты Lava.top?")) return;

    rankCheckoutInProgress = true;
    showMessage("Создаём счёт Lava.top...");
    try {
        const response = await fetch(SHADOWLAND_WORKER_URL + item.path, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname, email, currency })
        });
        let data = null;
        try {
            data = await response.json();
        } catch (error) {
            throw new Error("Payment server returned invalid JSON");
        }
        // Block checkout if the backend returns a different item or amount.
        const expectedAmount = currency === "USD" ? item.usd : item.rub;
        if (!response.ok || !data?.ok || !data?.paymentUrl ||
            String(data.product).toLowerCase() !== rankKey ||
            data.currency !== currency ||
            Math.abs(Number(data.amount) - expectedAmount) > 0.001) {
            console.error("Rank checkout failed validation:", data?.error || data);
            showMessage("Не удалось открыть оплату по указанной цене. Попробуй позже.");
            return;
        }

        const paymentUrl = new URL(data.paymentUrl);
        if (paymentUrl.protocol !== "https:" || paymentUrl.hostname !== "app.lava.top") {
            throw new Error("Unexpected payment URL origin");
        }

        try {
            localStorage.setItem("shadowland_nickname", nickname);
            localStorage.setItem("shadowland_email", email);
            localStorage.setItem("shadowland_product", item.name);
            localStorage.setItem("shadowland_price", String(item.rub));
        } catch (storageError) {
            console.warn("Checkout preferences were not stored.");
        }
        window.location.assign(paymentUrl.href);
    } catch (error) {
        console.error("Rank checkout error:", error);
        showMessage("Не удалось подключиться к Lava.top. Попробуй позже.");
    } finally {
        rankCheckoutInProgress = false;
    }
}


// Rank buttons now check the authenticated Minecraft rank before selecting a price.
// The user's browser never supplies the old rank or the amount to /lava/create-upgrade.
const SL_RANK_ORDER = ["default","silver","wither","reaper","titan","legend","overlord","imperator","shadow"];
const SL_RANK_PRICES = {default:0,silver:25,wither:50,reaper:75,titan:110,legend:140,overlord:199,imperator:349,shadow:599};
let slRankQuoteBusy = false;

async function buyRank(rank) {
    const key = String(rank||"").toLowerCase();
    const item = STORE_RANKS[key];
    if (!item || slRankQuoteBusy || rankCheckoutInProgress) return;
    const nicknameInput = document.getElementById("nickname");
    const nickname = (nicknameInput?.value || "").trim();
    if (!/^[A-Za-z0-9_]{3,16}$/.test(nickname)) {
        nicknameInput?.focus();
        showMessage("Введи Minecraft-ник (3–16 символов) вверху магазина.");
        return;
    }
    slRankQuoteBusy = true;
    try {
        let response, quote;
        try {
            const params = new URLSearchParams({ nickname, target: key });
            response = await fetch(SHADOWLAND_WORKER_URL +
                "/donate/upgrade-quote?" + params.toString(), {
                    method:"GET",cache:"no-store"
                });
            quote = await response.json();
        } catch (error) {
            response = null;
            quote = null;
        }
        if (quote?.error === "not_an_upgrade") {
            const currentRank = String(quote.currentRank || "").toLowerCase();
            if (currentRank === key) {
                showMessage("У тебя уже есть привилегия " + item.name +
                    ". Повторная покупка недоступна. Выбери привилегию выше своей.");
            } else if (SL_RANK_ORDER.includes(currentRank)) {
                showMessage("Нельзя купить привилегию " + item.name +
                    ": у тебя уже есть " + currentRank.toUpperCase() +
                    ". Можно приобрести только привилегию выше своей.");
            } else {
                showMessage("Нельзя купить привилегию ниже своей или повторно купить текущую. Выбери привилегию выше.");
            }
            return;
        }

        // Offline recipients are checked against the server registration registry.
        if (!response?.ok || quote?.ok !== true) {
            showMessage(shopRecipientError(quote?.error));
            return;
        }

        const oldRank = String(quote.currentRank);
        // The current Worker might still be the read-only version.
        // In that case preserve regular sales, but do not create upgrade invoices.
        if (quote.amountUsd == null && quote.checkoutEnabled === false) {
            if (oldRank === "default") {
                await buyRankFullPrice(key);
            } else {
                showMessage("Ранг найден: " + oldRank.toUpperCase() +
                    ". Для докупа нужно обновить Cloudflare Worker.");
            }
            return;
        }
        const rub = Number(quote.amountRub);
        const usd = Number(quote.amountUsd);
        if (!SL_RANK_ORDER.includes(oldRank) ||
            SL_RANK_ORDER.indexOf(oldRank)>=SL_RANK_ORDER.indexOf(key) ||
            String(quote.nickname).toLowerCase()!==nickname.toLowerCase() ||
            String(quote.targetRank)!==key ||
            rub !== SL_RANK_PRICES[key]-SL_RANK_PRICES[oldRank] ||
            !Number.isInteger(rub)||!Number.isFinite(usd)) {
            showMessage("Сервер вернул некорректную цену — покупка остановлена.");
            return;
        }
        if (oldRank==="default") {
            await buyRankFullPrice(key); // existing unchanged full-price route
            return;
        }
        if (rub < 50) {
            showMessage("Доплата "+oldRank.toUpperCase()+" → "+item.name+
                " = "+rub+" ₽. Минимальная сумма Lava.top — 50 ₽.");
            return;
        }
        if (quote.checkoutEnabled !== true) {
            showMessage("Оплата докупа ещё не включена на Cloudflare. Покупка остановлена.");
            return;
        }
        await buyRankUpgrade(key,nickname,oldRank,rub,usd,quote.usdPayable===true);
    } finally {
        slRankQuoteBusy=false;
    }
}

async function buyRankUpgrade(rankKey,nickname,oldRank,rub,usd,usdPayable) {
    const item=STORE_RANKS[rankKey];
    const email=await requestBuyerEmail(item.name+" (докуп)");
    if(!email) return;
    let currency;
    if(!usdPayable) {
        if(!confirm("Доплата "+oldRank.toUpperCase()+" → "+item.name+" составляет "+rub+
            " ₽.\nLava.top не принимает доплаты в долларах ниже $5."+
            "\nПродолжить оплату в рублях?")) return;
        currency="RUB";
    } else {
        currency=await requestPaymentCurrency(rub,usd);
    }
    if(!currency)return;
    const expected=currency==="USD"?usd:rub;
    const shown=currency==="USD"?"$"+usd.toFixed(2):rub+" ₽";
    if(!confirm("ДОКУП: "+oldRank.toUpperCase()+" → "+item.name+
       "\nПолная цена: "+item.rub+" ₽"+
       "\nУчтён текущий ранг: "+(item.rub-rub)+" ₽"+
       "\nНик: "+nickname+"\nE-mail: "+email+
       "\nК оплате: "+shown+
       "\n\nОткрыть оплату Lava.top?")) return;

    rankCheckoutInProgress=true;
    showMessage("Создаём счёт на "+shown+"...");
    try {
        const response=await fetch(SHADOWLAND_WORKER_URL+"/lava/create-upgrade",{
            method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({nickname,email,currency,target:rankKey})
        });
        let data=null;
        try{data=await response.json()}catch{}
        if(!response.ok||!data?.ok||data?.purchaseType!=="upgrade"||
           data?.targetRank!==rankKey||data?.currentRank!==oldRank||
           data?.currency!==currency||Math.abs(Number(data?.amount)-expected)>0.001||
           !data?.paymentUrl){
            console.error("Lava upgrade error:",data?.error||data);
            if(data?.error==="player_not_registered"||data?.error==="shop_registry_unavailable"||data?.error==="grief_rank_not_purchasable")
                showMessage(shopRecipientError(data.error));
            else if(data?.error==="rank_not_verified"||data?.error==="not_an_upgrade")
                showMessage("Ранг изменился или устарел. Обнови страницу и попробуй ещё раз.");
            else if(data?.error==="too_many_requests")
                showMessage("Счёт только что создавался. Повтори попытку через 30 секунд.");
            else showMessage("Оплата докупа пока недоступна. Деньги не списаны.");
            return;
        }
        const paymentUrl=new URL(data.paymentUrl);
        if(paymentUrl.protocol!=="https:"||paymentUrl.hostname!=="app.lava.top")
            throw Error("Unexpected payment provider URL");
        try {
            localStorage.setItem("shadowland_nickname",nickname);
            localStorage.setItem("shadowland_email",email);
            localStorage.setItem("shadowland_product",item.name+" (докуп)");
            localStorage.setItem("shadowland_price",String(rub));
        } catch {}
        window.location.assign(paymentUrl.href);
    } catch(error) {
        console.error("Lava upgrade checkout:",error);
        showMessage("Нет связи с оплатой. Деньги не списаны.");
    } finally {
        rankCheckoutInProgress=false;
    }
}

// Keep backwards compatibility with older links/handlers.
function buyNewRank(rank) {
    return buyRank(rank);
}


// ============================================================
// WITHER — shared checkout to prevent stale price/offer routing.
// ============================================================
function buyWither() { return buyRank("wither"); }

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

    if (!await checkShopRecipient(nickname)) return;
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
// IMPERATOR — shared checkout to prevent stale price/offer routing.
// ============================================================
function buyImperator() { return buyRank("imperator"); }

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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

    if (!await checkShopRecipient(nickname)) return;
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

function requestPaymentCurrency(rubPrice = 70, usdPrice = 0.83, options = null) {
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
        description.textContent = options ? (options.enabled ? "Выбери валюту оплаты." : "Приём оплаты пока отключён.") : "Для России — рубли. Для Украины и других стран — доллары.";

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

        const extraButtons = [];
        if (options) {
            usdButton.textContent = "🇺🇸 Доллары — $" + usdPrice;
            const eur = document.createElement("button");
            eur.type = "button";
            eur.textContent = "🇪🇺 Евро — €" + Number(options.eur).toFixed(2);
            const uah = document.createElement("button");
            uah.type = "button";
            uah.textContent = options.uah === null ? "🇺🇦 грн — курс недоступен" : "🇺🇦 ≈ " + options.uah + " грн";
            extraButtons.push([eur,"EUR"],[uah,"UAH"]);
        }
        [rubButton, usdButton, ...extraButtons.map(([button])=>button)].forEach(button => {
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

        if (options) {
            for (const [button, code] of [[rubButton,"RUB"],[usdButton,"USD"],...extraButtons]) {
                const currency = code === "UAH" ? "USD" : code;
                const eligible = options.payable[currency] === true && (code !== "UAH" || options.uah !== null);
                if (!eligible && !(code === "UAH" && options.uah === null)) button.textContent += " · ниже минимума";
                button.disabled = !options.enabled || !eligible;
                if (button.disabled) {
                    button.style.opacity = ".55";
                    button.style.cursor = "not-allowed";
                }
            }
            extraButtons.forEach(([button,code])=>button.addEventListener("click",()=>close(code)));
        }
        buttons.append(rubButton, usdButton, ...extraButtons.map(([button])=>button));
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
    const button = wrapper?.querySelector(".nickname-check");
    if (!input || !wrapper || !button) return;

    const isValid = value => /^[A-Za-z0-9_]{3,16}$/.test(value);
    const savedKey = "shadowland_nickname";
    const confirmedKey = "shadowland_nickname_confirmed";
    let confirmedNickname = "";
    try {
        const saved = localStorage.getItem(savedKey);
        if (saved && isValid(saved)) input.value = saved;
        const confirmed = localStorage.getItem(confirmedKey);
        if (confirmed && confirmed === input.value) confirmedNickname = confirmed;
    } catch {}

    function update(edited = false) {
        input.value = input.value.replace(/[^A-Za-z0-9_]/g, "").slice(0, 16);
        const valid = isValid(input.value);
        if (edited && confirmedNickname !== input.value) {
            confirmedNickname = "";
            try { localStorage.removeItem(confirmedKey); } catch {}
        }
        const confirmed = valid && confirmedNickname === input.value;
        wrapper.classList.toggle("valid", valid);
        wrapper.classList.toggle("nickname-confirmed", confirmed);
        button.textContent = confirmed ? "✓" : "→";
        button.disabled = !valid || confirmed;
        button.setAttribute("aria-label", confirmed ? "Ник подтверждён" : "Подтвердить Minecraft-ник");
        button.title = confirmed ? "Ник подтверждён" : "Подтвердить ник";
        if (valid) {
            try { localStorage.setItem(savedKey, input.value); } catch {}
        }
    }

    function confirmNickname() {
        update();
        if (!isValid(input.value)) return;
        confirmedNickname = input.value;
        try {
            localStorage.setItem(savedKey, confirmedNickname);
            localStorage.setItem(confirmedKey, confirmedNickname);
        } catch {}
        update();
    }

    input.addEventListener("input", () => update(true));
    input.addEventListener("keydown", event => {
        if (event.key === "Enter" && !event.isComposing) {
            event.preventDefault();
            confirmNickname();
        }
    });
    button.addEventListener("click", confirmNickname);
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
    // Keep URL fragments intact so navigation works when coming from rules.html.
}

function showShopTab(tabId, button) {
    const tabs = ["donate-tab", "coins-tab", "cases-tab"];
    if (!tabs.includes(tabId)) return;

    tabs.forEach(id => {
        const section = document.getElementById(id);
        if (section) {
            section.style.display = id === tabId ? "block" : "none";
        }
    });

    document.querySelectorAll(".shop-tab").forEach((tab, index) => {
        const active = tabs[index] === tabId;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
    });
}

// Main menu / footer links and links returning from the rules page share the same shop tabs.
function setupShopNavigation() {
    const tabs = ["donate-tab", "coins-tab", "cases-tab"];
    const scrollToShop = (smooth) => {
        const bar = document.querySelector(".shop-tabs");
        if (bar) bar.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    };
    const open = (id, smooth) => {
        if (!tabs.includes(id)) return;
        showShopTab(id);
        scrollToShop(smooth);
    };

    document.querySelectorAll('a[href="#donate-tab"],a[href="#coins-tab"],a[href="#cases-tab"]').forEach(link => {
        link.addEventListener("click", event => {
            event.preventDefault();
            const id = link.getAttribute("href").slice(1);
            history.replaceState(null, "", "#" + id);
            open(id, true);
        });
    });

    // Category cards keep their original tab selection and smoothly reveal the products.
    document.querySelectorAll(".shop-tab").forEach((tab, index) => {
        tab.addEventListener("click", () => {
            const id = tabs[index];
            if (!id) return;
            history.replaceState(null, "", "#" + id);
            if (!tab.closest("#showcase-categories")) return;
            requestAnimationFrame(() => {
                const section = document.getElementById(id);
                if (!section || !section.getClientRects().length) return;
                const target = section.querySelector(".sl-coinforge-heading, .section-heading") || section;
                const header = document.querySelector(".header");
                const offset = Math.max(0, header ? header.getBoundingClientRect().bottom : 0) + 24;
                const top = Math.max(0, window.scrollY + target.getBoundingClientRect().top - offset);
                const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                window.scrollTo({ top, behavior: reducedMotion ? "instant" : "smooth" });
            });
        });
    });

    const initial = window.location.hash.slice(1);
    if (tabs.includes(initial)) {
        requestAnimationFrame(() => open(initial, false));
    }

    window.addEventListener("hashchange", () => {
        const id = window.location.hash.slice(1);
        if (tabs.includes(id)) open(id, false);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fixInitialPosition();
    setupNickname();
    setupReveal();
    setupHeader();

    const status = new URLSearchParams(window.location.search).get("payment");
    if (status === "success") {
        showMessage("Спасибо! Ожидаем подтверждение Lava.top. Выдача ранга произойдёт после уведомления сервера.");
    } else if (status === "failed") {
        showMessage("Оплата не прошла. Деньги и статус проверь в Lava.top.");
    } else if (status === "cancelled") {
        showMessage("Оплата отменена. Донат не оформлен.");
    }

    const donate = document.getElementById("donate-tab");
    const coins = document.getElementById("coins-tab");
    const cases = document.getElementById("cases-tab");

    if (donate) donate.style.display = "block";
    if (coins) coins.style.display = "none";
    if (cases) cases.style.display = "none";
    setupShopNavigation();
});


// DUELS: independent verified quotes and gated checkout.
const SL_DUEL_PRICES=Object.freeze({default:0,vip:50,prime:75,elite:125,berserk:195,conqueror:295,immortal:445,dominator:695});
const SL_DUEL_PACKS=Object.freeze({case3:99,case10:279,case30:645});
const SL_DUEL_API="https://shadowland-payments.josh1rogh.workers.dev";
let slDuelBusy=false;
function duelMoney(amount,c){return c==="RUB"?amount+" ₽":(c==="USD"?"$":"€")+Number(amount).toFixed(2);}
// UAH is an estimated display amount; the provider invoice remains in USD.
async function duelUahRate(){
    const key="sl_duel_usd_uah_rate";
    let cached;
    try{cached=JSON.parse(localStorage.getItem(key)||"null");}catch{}
    const valid=x=>Number.isFinite(x?.rate)&&x.rate>0&&Number.isFinite(x?.time)&&Date.now()-x.time>=0&&Date.now()-x.time<48*3600000;
    if(valid(cached)&&Date.now()-cached.time<6*3600000)return cached.rate;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),3500);
    try{
        const res=await fetch("https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=USD&json",{signal:controller.signal,cache:"no-store"});
        if(!res.ok)throw Error("NBU rate unavailable");
        const data=await res.json(),rate=Number(data.find(x=>x.cc==="USD")?.rate);
        if(!Number.isFinite(rate)||rate<=0)throw Error("Invalid NBU rate");
        try{localStorage.setItem(key,JSON.stringify({rate,time:Date.now()}));}catch{}
        return rate;
    }catch{
        if(valid(cached))return cached.rate;
        // Verified official NBU rate for 25 Nov 2026; never use indefinitely.
        if(Date.now()>=Date.parse("2026-11-25T00:00:00+02:00")&&Date.now()<Date.parse("2026-11-27T00:00:00+02:00"))return 45.3541;
        return null;
    }finally{clearTimeout(timer);}
}
async function buyDuelProduct(target){
    if(slDuelBusy)return;
    const input=document.getElementById("nickname"),nickname=(input?.value||"").trim();
    if(!/^[A-Za-z0-9_]{3,16}$/.test(nickname)){input?.focus();showMessage("Укажи Minecraft-ник вверху магазина.");return;}
    const pack=Object.hasOwn(SL_DUEL_PACKS,target),name=pack?target.slice(4)+" кейсов дуэлей":target.toUpperCase();
    slDuelBusy=true;
    try{
        const res=await fetch(SL_DUEL_API+"/duel/quote?"+new URLSearchParams({nickname,target}),{cache:"no-store"}),q=await res.json();
        if(["duel_rank_not_verified","player_not_registered","shop_registry_unavailable"].includes(q.error)){showMessage(shopRecipientError(q.error));return;}
        if(q.error==="not_an_upgrade"){showMessage("У тебя уже есть "+String(q.currentRank).toUpperCase()+". Выбери привилегию выше.");return;}
        if(!res.ok||q.ok!==true||q.target!==target||String(q.nickname).toLowerCase()!==nickname.toLowerCase()||!Object.hasOwn(SL_DUEL_PRICES,q.currentRank)){showMessage("Не удалось проверить стоимость.");return;}
        const rub=pack?SL_DUEL_PACKS[target]:SL_DUEL_PRICES[target]-SL_DUEL_PRICES[q.currentRank];
        if(!Number.isInteger(rub)||rub<=0||q.amountRub!==rub||q.prices?.RUB!==rub||!["RUB","USD","EUR"].every(c=>Number.isFinite(q.prices?.[c])&&q.prices[c]>0&&typeof q.payable?.[c]==="boolean")){showMessage("Некорректная цена. Покупка остановлена.");return;}
        const purchaseName=q.purchaseType==="upgrade"?name+" (докуп)":name;
        const email=await requestBuyerEmail(purchaseName);if(!email)return;
        const rate=await duelUahRate();
        const uah=rate===null?null:Math.round(q.prices.USD*rate);
        const choice=await requestPaymentCurrency(q.amountRub,q.prices.USD.toFixed(2),{eur:q.prices.EUR,uah,payable:q.payable,enabled:q.checkoutEnabled===true});
        const currency=choice==="UAH"?"USD":choice;
        if(!currency||q.checkoutEnabled!==true||q.payable[currency]!==true)return;
        const paymentText=choice==="UAH"?"≈ "+uah+" грн (счёт Lava.top: "+duelMoney(q.prices.USD,"USD")+". Итоговая сумма зависит от курса банка и комиссии.)":duelMoney(q.prices[currency],currency);
        const summary=q.purchaseType==="upgrade"?"ДОКУП: "+q.currentRank.toUpperCase()+" → "+name+"\nПолная цена: "+SL_DUEL_PRICES[target]+" ₽\nУчтён текущий ранг: "+(SL_DUEL_PRICES[target]-rub)+" ₽":(pack?"Кейсы: ":"Привилегия: ")+name;
        if(!confirm(summary+"\nMinecraft-ник: "+nickname+"\nE-mail: "+email+"\nК оплате: "+paymentText+"\n\nПроверь данные. Продолжая, ты соглашаешься с условиями покупки на shadowland.land/rules.html.\n\nОткрыть страницу оплаты Lava.top?"))return;
        showMessage("Создаём счёт Lava.top...");
        const response=await fetch(SL_DUEL_API+"/lava/create-duel",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nickname,target,email,currency})}),data=await response.json();
        if(!response.ok||data.ok!==true){
            const messages={
                too_many_requests:"Счёт уже создавался. Повтори покупку через 60 секунд после последней попытки.",
                duel_rank_not_verified:shopRecipientError("duel_rank_not_verified"),
                player_not_registered:shopRecipientError("player_not_registered"),
                shop_registry_unavailable:shopRecipientError("shop_registry_unavailable"),
                not_an_upgrade:"У тебя уже есть эта привилегия или выше.",
                fixed_duel_offer_not_configured:"Товар временно недоступен: не удалось проверить цену Lava.top.",
                below_lava_minimum:"Эта сумма ниже минимальной суммы оплаты Lava.top.",
                duel_checkout_disabled:"Оплата дуэлей временно отключена.",
                invalid_parameters:"Проверь адрес e-mail и валюту оплаты.",
                invalid_lava_invoice_response:"Lava.top вернул некорректный ответ. Повтори позже."
            };
            const message=messages[data.error]||(data.error==="lava_create_invoice_error"?"Lava.top отклонил создание счёта (HTTP "+Number(data.status)+").":"Не удалось создать счёт. Код: "+String(data.error||response.status));
            console.warn("Duel checkout rejected:",response.status,data.error,data.status);
            showMessage(message);return;
        }
        if(data.target!==target||String(data.nickname).toLowerCase()!==nickname.toLowerCase()||data.currency!==currency||data.amount!==q.prices[currency]||typeof data.paymentUrl!=="string"){
            showMessage("Данные счёта изменились. Повтори проверку цены.");return;
        }
        const url=new URL(data.paymentUrl);if(url.protocol!=="https:"||url.hostname!=="app.lava.top"||url.username||url.password)throw Error("Unexpected checkout URL");
        try{
            localStorage.setItem("shadowland_nickname",nickname);
            localStorage.setItem("shadowland_email",email);
            localStorage.setItem("shadowland_product",purchaseName);
            localStorage.setItem("shadowland_price",String(rub));
        }catch{}
        window.location.assign(url.href);
    }catch(e){console.error("Duel checkout:",e);showMessage("Не удалось связаться с оплатой дуэлей. Попробуй позже.");}finally{slDuelBusy=false;}
}
document.addEventListener("DOMContentLoaded",()=>{
    function connect(card,target,selector){const b=card.querySelector(selector);if(!b)return;b.disabled=false;b.textContent="КУПИТЬ";b.title="Проверить стоимость и доступность оплаты";b.addEventListener("click",()=>buyDuelProduct(target));}
    document.querySelectorAll(".sl-duel-rank-card").forEach(card=>{const target=card.querySelector(".sl-rank-title")?.textContent.trim().toLowerCase();if(target!=="default"&&Object.hasOwn(SL_DUEL_PRICES,target))connect(card,target,".sl-rank-button");});
    document.querySelectorAll(".sl-duel-case-card").forEach(card=>{const n=card.querySelector(".sl-item-badge")?.textContent.trim().match(/^×(3|10|30)$/)?.[1];if(n)connect(card,"case"+n,".sl-store-buy");});
    const note=document.querySelector("#duels-donate > p.sl-duel-info");if(note)note.textContent=note.textContent.replace("Оплата пока не подключена.","Нажми «КУПИТЬ» для проверки цены с учётом текущего ранга. Игроку не обязательно находиться онлайн.");
    const caseNote=document.querySelector("#duels-cases > p.sl-duel-info");if(caseNote)caseNote.textContent="Нажми «КУПИТЬ» для проверки стоимости и доступных валют. Игроку не обязательно находиться онлайн.";
});
