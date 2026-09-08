```javascript
// ============================================================
// NOVEXIA STORE
// ============================================================

const SERVER_IP = "play.novexia.ru";

// ============================================================
// COPY SERVER IP
// ============================================================

function copyIP() {
    navigator.clipboard.writeText(SERVER_IP)
        .then(() => {
            showMessage("IP сервера скопирован: " + SERVER_IP);
        })
        .catch(() => {
            showMessage("IP сервера: " + SERVER_IP);
        });
}

// ============================================================
// BUY
// ============================================================

function buy(product, price) {

    const nicknameInput = document.getElementById("nickname");
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

    /*
        Сейчас здесь находится демонстрационная покупка.

        Когда будет подключён Tebex,
        эту функцию заменим на реальную ссылку
        оплаты конкретного товара.
    */

    showMessage(
        "Покупка: " +
        product +
        " | " +
        price +
        " ₽ | Игрок: " +
        nickname
    );
}

// ============================================================
// MESSAGE
// ============================================================

function showMessage(text) {

    const oldMessage = document.querySelector(".site-message");

    if (oldMessage) {
        oldMessage.remove();
    }

    const message = document.createElement("div");

    message.className = "site-message";
    message.textContent = text;

    Object.assign(message.style, {
        position: "fixed",
        left: "50%",
        bottom: "25px",
        transform: "translateX(-50%)",
        zIndex: "9999",
        maxWidth: "calc(100% - 30px)",
        padding: "14px 20px",
        background: "#10161e",
        color: "#ffffff",
        border: "1px solid rgba(57,255,136,.35)",
        borderRadius: "10px",
        boxShadow: "0 15px 40px rgba(0,0,0,.4)",
        fontSize: "14px",
        fontWeight: "700",
        textAlign: "center"
    });

    document.body.appendChild(message);

    setTimeout(() => {

        message.style.opacity = "0";
        message.style.transition = "opacity .3s";

        setTimeout(() => {
            message.remove();
        }, 300);

    }, 3000);
}

// ============================================================
// NICKNAME
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    const nickname = document.getElementById("nickname");

    if (!nickname) {
        return;
    }

    nickname.addEventListener("input", () => {

        nickname.value = nickname.value
            .replace(/[^A-Za-z0-9_]/g, "")
            .slice(0, 16);

    });

});

// ============================================================
// SCROLL REVEAL
// ============================================================

const observer = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";
                entry.target.style.transform = "translateY(0)";

                observer.unobserve(entry.target);
            }

        });

    },
    {
        threshold: 0.08
    }
);

document.addEventListener("DOMContentLoaded", () => {

    document
        .querySelectorAll(".product, .advantages > div, .player-card")
        .forEach(element => {

            element.style.opacity = "0";
            element.style.transform = "translateY(15px)";
            element.style.transition =
                "opacity .5s ease, transform .5s ease";

            observer.observe(element);

        });

});
```
