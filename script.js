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
// COPY SERVER IP
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

        showMessage(
            "Поле ника не найдено."
        );

        return;
    }


    const nickname =
        nicknameInput.value.trim();


    // ========================================================
    // EMPTY NICKNAME
    // ========================================================

    if (!nickname) {

        nicknameInput.focus();

        showMessage(
            "Сначала введи свой Minecraft ник!"
        );

        return;
    }


    // ========================================================
    // INVALID NICKNAME
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
    // SAVE NICKNAME
    // ========================================================

    localStorage.setItem(
        "shadowland_nickname",
        nickname
    );


    // ========================================================
    // GET PRODUCT LINK
    // ========================================================

    const productLink =
        PRODUCT_LINKS[product];


    // ========================================================
    // PRODUCT NOT CONNECTED
    // ========================================================

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

    const oldMessage =
        document.querySelector(
            ".site-message"
        );


    if (oldMessage) {

        oldMessage.remove();

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
                "9999",

            maxWidth:
                "calc(100% - 28px)",

            padding:
                "13px 18px",

            background:
                "rgba(10,14,20,.97)",

            color:
                "#ffffff",

            border:
                "1px solid rgba(71,255,145,.26)",

            borderRadius:
                "11px",

            boxShadow:
                "0 18px 50px rgba(0,0,0,.46)",

            fontSize:
                "12px",

            fontWeight:
                "800",

            textAlign:
                "center",

            opacity:
                "1"

        }
    );


    document.body.appendChild(
        message
    );


    setTimeout(
        () => {

            message.style.opacity =
                "0";

            message.style.transition =
                "opacity .25s";


            setTimeout(
                () => {

                    message.remove();

                },
                250
            );

        },
        2800
    );

}


// ============================================================
// NICKNAME
// ============================================================

function setupNickname() {

    const nickname =
        document.getElementById(
            "nickname"
        );


    const wrap =
        document.querySelector(
            ".nickname-wrap"
        );


    if (!nickname) {

        return;

    }


    // ========================================================
    // LOAD SAVED NICK
    // ========================================================

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

        nickname.value =
            saved;

    }


    // ========================================================
    // UPDATE
    // ========================================================

    const update = () => {

        nickname.value =
            nickname.value

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
                nickname.value
            );


        if (wrap) {

            wrap.classList.toggle(
                "valid",
                valid
            );

        }


        if (valid) {

            localStorage.setItem(
                "shadowland_nickname",
                nickname.value
            );

        }

    };


    nickname.addEventListener(
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

            ".product, " +
            ".advantages > div, " +
            ".player-card, " +
            ".section-title, " +
            ".coming-soon"

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


                            observer
                                .unobserve(
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


    const update = () => {

        header.classList.toggle(

            "scrolled",

            window.scrollY > 20

        );

    };


    window.addEventListener(

        "scroll",

        update,

        {
            passive:
                true
        }

    );


    update();

}


// ============================================================
// PARTICLES
// ============================================================

function setupParticles() {

    const canvas =
        document.getElementById(
            "particles"
        );


    if (!canvas) {

        return;

    }


    const ctx =
        canvas.getContext(
            "2d"
        );


    if (!ctx) {

        return;

    }


    let width =
        0;


    let height =
        0;


    let particles =
        [];


    // ========================================================
    // RESIZE
    // ========================================================

    function resize() {

        const dpr =
            Math.min(

                window.devicePixelRatio ||
                1,

                2

            );


        width =
            window.innerWidth;


        height =
            window.innerHeight;


        canvas.width =
            width * dpr;


        canvas.height =
            height * dpr;


        canvas.style.width =
            width + "px";


        canvas.style.height =
            height + "px";


        ctx.setTransform(

            dpr,
            0,
            0,
            dpr,
            0,
            0

        );


        const count =
            Math.min(

                60,

                Math.max(

                    22,

                    Math.floor(
                        width / 28
                    )

                )

            );


        particles =
            Array.from(

                {
                    length:
                        count
                },

                () => ({

                    x:
                        Math.random() *
                        width,

                    y:
                        Math.random() *
                        height,

                    r:
                        Math.random() *
                        1.2 +
                        .3,

                    speed:
                        Math.random() *
                        .16 +
                        .04,

                    alpha:
                        Math.random() *
                        .3 +
                        .08

                })

            );

    }


    // ========================================================
    // DRAW
    // ========================================================

    function draw() {

        ctx.clearRect(

            0,
            0,
            width,
            height

        );


        particles.forEach(
            particle => {

                particle.y -=
                    particle.speed;


                if (
                    particle.y < -10
                ) {

                    particle.y =
                        height + 10;


                    particle.x =
                        Math.random() *
                        width;

                }


                ctx.beginPath();


                ctx.fillStyle =

                    "rgba(" +
                    "130," +
                    "255," +
                    "178," +
                    particle.alpha +
                    ")";


                ctx.arc(

                    particle.x,

                    particle.y,

                    particle.r,

                    0,

                    Math.PI * 2

                );


                ctx.fill();

            }
        );


        requestAnimationFrame(
            draw
        );

    }


    window.addEventListener(

        "resize",

        resize

    );


    resize();

    draw();

}


// ============================================================
// START
// ============================================================

document.addEventListener(

    "DOMContentLoaded",

    () => {

        setupNickname();

        setupReveal();

        setupHeader();

        setupParticles();

    }

);
