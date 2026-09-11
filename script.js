// ============================================================
// SHADOWLAND STORE
// ============================================================

const SERVER_IP = "shadowland.land";
const DONATEPAY_URL = "https://donatepay.ru/don/1531880";

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
    const termsAccepted = document.getElementById("termsAccepted");
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

    if (!termsAccepted || !termsAccepted.checked) {
        showMessage("Перед покупкой прими условия покупки и возврата.");
        if (termsAccepted) termsAccepted.focus();
        return;
    }

    localStorage.setItem("shadowland_nickname", nickname);
    localStorage.setItem("shadowland_product", product);
    localStorage.setItem("shadowland_price", String(price));
    localStorage.setItem("shadowland_terms_accepted_at", new Date().toISOString());

    const confirmed = confirm(
        "Покупка: " + product +
        "\nMinecraft ник: " + nickname +
        "\nТочная сумма: " + price + " ₽" +
        "\n\nВАЖНО: на DonatePay введи ТОТ ЖЕ ник и ТОЧНО эту сумму. Не меняй сумму." +
        "\n\nЕсли платёж прошёл, но товар не выдан, сохрани чек и напиши на shadowland.land@gmail.com."
    );

    if (!confirmed) return;

    showMessage("Открываем платёжную страницу...");

    setTimeout(() => {
        window.location.href = DONATEPAY_URL;
    }, 300);
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

function showShopTab(tabId, button = null, shouldScroll = false) {
    const tabs = ["donate-tab", "coins-tab", "cases-tab"];

    tabs.forEach(id => {
        const section = document.getElementById(id);
        if (section) section.style.display = id === tabId ? "block" : "none";
    });

    document.querySelectorAll(".shop-tab").forEach(tab => {
        tab.classList.remove("active");
    });

    let activeButton = button;
    if (!activeButton) {
        activeButton = Array.from(document.querySelectorAll(".shop-tab")).find(tab =>
            (tab.getAttribute("onclick") || "").includes(`'${tabId}'`)
        );
    }
    if (activeButton) activeButton.classList.add("active");

    if (shouldScroll) {
        const tabsBlock = document.querySelector(".shop-tabs");
        if (tabsBlock) tabsBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function setupShopNavigation() {
    const validTabs = new Set(["donate-tab", "coins-tab", "cases-tab"]);

    document.querySelectorAll('a[href*="#donate-tab"], a[href*="#coins-tab"], a[href*="#cases-tab"]').forEach(link => {
        link.addEventListener("click", event => {
            const url = new URL(link.href, window.location.href);
            const tabId = url.hash.slice(1);
            if (!validTabs.has(tabId)) return;

            if (url.pathname === window.location.pathname || url.pathname.endsWith("/index.html")) {
                event.preventDefault();
                history.replaceState(null, "", `#${tabId}`);
                showShopTab(tabId, null, true);
            }
        });
    });

    const hashTab = window.location.hash.slice(1);
    if (validTabs.has(hashTab)) {
        showShopTab(hashTab);
    } else {
        showShopTab("donate-tab");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    setupNickname();
    setupReveal();
    setupHeader();
    setupShopNavigation();
});
