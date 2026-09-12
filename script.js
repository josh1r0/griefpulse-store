// ============================================================
// SHADOWLAND STORE
// ============================================================

const SERVER_IP = "shadowland.land";
const DONATEPAY_URL = "https://donatepay.ru/don/1531880";
const SHADOWLAND_WORKER_URL = "https://pay.shadowland.land";

async function copyIP() {
    try {
        await navigator.clipboard.writeText(SERVER_IP);
        showMessage("IP скопирован: " + SERVER_IP);
    } catch (error) {
        showMessage("IP сервера: " + SERVER_IP);
    }
}

function buy(product, price) {
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

    const email = await requestBuyerEmail();
    if (!email) return;

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_email", email);
    localStorage.setItem("shadowland_product", "Wither");
    localStorage.setItem("shadowland_price", "70");

    const confirmed = confirm(
        "Покупка: WITHER" +
        "\nMinecraft ник: " + nickname +
        "\nE-mail: " + email +
        "\nСумма: 70 ₽" +
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
                    email: email
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
// E-MAIL ПОКУПАТЕЛЯ — ТЁМНОЕ ОКНО БЕЗ ИЗМЕНЕНИЯ STYLE.CSS
// ============================================================

function requestBuyerEmail() {
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
        title.textContent = "E-mail для покупки WITHER";

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
