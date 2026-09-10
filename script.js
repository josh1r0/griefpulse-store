// ============================================================
// SHADOWLAND STORE
// ============================================================

const SERVER_IP = "shadowland.land";


// ============================================================
// CRAFTINGSTORE LINKS
// ============================================================

const PRODUCT_LINKS = {

    "Silver":
        "https://shadowlandmc.craftingstore.net/package/1592426"

};


// ============================================================
// COPY IP
// ============================================================

async function copyIP() {

    try {

        await navigator.clipboard.writeText(
            SERVER_IP
        );


        showMessage(
            "IP скопирован: " +
            SERVER_IP
        );


    } catch (error) {


        showMessage(
            "IP сервера: " +
            SERVER_IP
        );


    }

}


// ============================================================
// BUY
// ============================================================

function buy(product, price) {


    const nicknameInput =
        document.getElementById(
            "nickname"
        );


    if (!nicknameInput) {

        return;

    }


    const nickname =
        nicknameInput.value.trim();


    // ========================================================
    // EMPTY
    // ========================================================

    if (!nickname) {


        nicknameInput.focus();


        showMessage(
            "Сначала введи свой Minecraft ник!"
        );


        return;

    }


    // ========================================================
    // VALIDATE
    // ========================================================

    if (
        !/^[A-Za-z0-9_]{3,16}$/.test(
            nickname
        )
    ) {


        nicknameInput.focus();


        showMessage(
            "Проверь Minecraft ник. Допустимо 3–16 символов."
        );


        return;

    }


    // ========================================================
    // SAVE
    // ========================================================

    localStorage.setItem(
        "shadowland_nickname",
        nickname
    );


    // ========================================================
    // LINK
    // ========================================================

    const productLink =
        PRODUCT_LINKS[product];


    if (!productLink) {


        showMessage(
            "Этот товар пока ещё не подключён к оплате."
        );


        return;

    }


    // ========================================================
    // REDIRECT
    // ========================================================

    showMessage(

        "Переходим к покупке " +

        product +

        " за " +

        price +

        " ₽"

    );


    setTimeout(
        () => {


            window.location.href =
                productLink;


        },
        500
    );

}


// ============================================================
// MESSAGE
// ============================================================

function showMessage(text) {


    const old =
        document.querySelector(
            ".site-message"
        );


    if (old) {

        old.remove();

    }


    const message =
        document.createElement(
            "div"
        );


    message.className =
        "site-message";


    message.textContent =
        text;


    Object.assign(
        message.style,
        {

            position:
                "fixed",

            left:
                "50%",

            bottom:
                "24px",

            transform:
                "translateX(-50%)",

            zIndex:
                "99999",

            maxWidth:
                "calc(100% - 30px)",

            padding:
                "12px 18px",

            borderRadius:
                "9px",

            background:
                "rgba(7,10,15,.97)",

            border:
                "1px solid rgba(66,255,138,.28)",

            boxShadow:
                "0 15px 45px rgba(0,0,0,.5)",

            color:
                "#ffffff",

            fontSize:
                "11px",

            fontWeight:
                "800",

            textAlign:
                "center",

            transition:
                "opacity .25s"

        }
    );


    document.body.appendChild(
        message
    );


    setTimeout(
        () => {


            message.style.opacity =
                "0";


            setTimeout(
                () => {

                    message.remove();

                },
                260
            );


        },
        2800
    );

}


// ============================================================
// NICKNAME
// ============================================================

function setupNickname() {


    const input =
        document.getElementById(
            "nickname"
        );


    const wrapper =
        document.querySelector(
            ".nickname-wrap"
        );


    if (!input) {

        return;

    }


    const saved =
        localStorage.getItem(
            "shadowland_nickname"
        );


    if (
        saved &&
        /^[A-Za-z0-9_]{3,16}$/.test(
            saved
        )
    ) {


        input.value =
            saved;


    }


    function update() {


        input.value =
            input.value

                .replace(
                    /[^A-Za-z0-9_]/g,
                    ""
                )

                .slice(
                    0,
                    16
                );


        const valid =
            /^[A-Za-z0-9_]{3,16}$/.test(
                input.value
            );


        if (wrapper) {


            wrapper.classList.toggle(
                "valid",
                valid
            );


        }


        if (valid) {


            localStorage.setItem(
                "shadowland_nickname",
                input.value
            );


        }

    }


    input.addEventListener(
        "input",
        update
    );


    update();

}


// ============================================================
// SCROLL REVEAL
// ============================================================

function setupReveal() {


    const elements =
        document.querySelectorAll(

            ".donate-card, " +

            ".coin-card, " +

            ".case-card, " +

            ".advantages article, " +

            ".section-heading, " +

            ".player-card"

        );


    elements.forEach(
        element => {


            element.classList.add(
                "reveal"
            );


        }
    );


    const observer =
        new IntersectionObserver(

            entries => {


                entries.forEach(
                    entry => {


                        if (
                            entry.isIntersecting
                        ) {


                            entry.target
                                .classList
                                .add(
                                    "visible"
                                );


                            observer.unobserve(
                                entry.target
                            );


                        }


                    }
                );


            },

            {

                threshold:
                    0.08

            }

        );


    elements.forEach(
        element => {


            observer.observe(
                element
            );


        }
    );

}


// ============================================================
// HEADER
// ============================================================

function setupHeader() {


    const header =
        document.querySelector(
            ".header"
        );


    if (!header) {

        return;

    }


    function updateHeader() {


        if (
            window.scrollY > 20
        ) {


            header.style.background =
                "rgba(3,5,8,.96)";


        } else {


            header.style.background =
                "rgba(3,5,8,.88)";


        }

    }


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive:
                true
        }
    );


    updateHeader();

}


// ============================================================
// FIX HASH POSITION
// ============================================================

function fixInitialPosition() {


    if (
        window.location.hash === "#shop"
    ) {


        history.replaceState(
            null,
            "",
            window.location.pathname
        );


        window.scrollTo(
            0,
            0
        );


    }

}


// ============================================================
// START
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {


        fixInitialPosition();

        setupNickname();

        setupReveal();

        setupHeader();


    }
);
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
    const donate = document.getElementById("donate-tab");
    const coins = document.getElementById("coins-tab");
    const cases = document.getElementById("cases-tab");

    if (donate) donate.style.display = "block";
    if (coins) coins.style.display = "none";
    if (cases) cases.style.display = "none";
});
