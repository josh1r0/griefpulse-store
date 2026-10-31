"use strict";
/* ShadowLand forum: direct submission to a separately deployed Worker API. */
(() => {
  const API = "https://forum-api.shadowland.land";
  const form = document.getElementById("sl-complaint-form");
  const send = document.getElementById("sl-complaint-send");
  const state = document.getElementById("sl-form-status");
  const captchaContainer = document.getElementById("sl-turnstile-container");
  const receipt = document.getElementById("sl-receipt");
  const lookup = document.getElementById("sl-lookup-form");
  const lookupResult = document.getElementById("sl-lookup-result");
  const list = document.getElementById("complaints-list");
  const feedback = document.getElementById("complaints-feedback");
  const search = document.getElementById("complaints-search");
  const status = document.getElementById("complaints-status");
  const refresh = document.getElementById("complaints-refresh");
  let connected = false, entries = [], turnstileId = null, sitekey = "";
  function textNode(tag, className, value) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = value;
    return el;
  }
  const statuses = {pending:"Ожидает проверки",open:"Открыта",review:"На рассмотрении",closed:"Закрыта",rejected:"Отклонена"};
  function fmtDate(value){return new Date(value).toLocaleDateString("ru-RU",{day:"2-digit",month:"long",year:"numeric"});}
  async function api(path, opts) {
    const response = await fetch(API + path, opts || {});
    let data = null;
    try { data = await response.json(); } catch {}
    if (!response.ok) throw new Error(data && data.error ? data.error : "Ошибка соединения с форумом");
    return data;
  }
  function statusMessage(message, error) {
    state.textContent = message;
    state.classList.toggle("sl-error", !!error);
  }
  async function init() {
    try {
      const config = await api("/api/config");
      if (!config.configured || !config.sitekey) throw new Error("Серверная часть форума пока не подключена.");
      connected = true;
      sitekey = config.sitekey;
      statusMessage("Форум подключён. Для отправки потребуется проверка от спама.");
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.onload = () => {
        if (!window.turnstile) return statusMessage("Не загрузилась проверка от спама.",true);
        turnstileId = window.turnstile.render(captchaContainer,{sitekey,theme:"dark"});
        send.disabled = false;
      };
      script.onerror = () => statusMessage("Не удалось загрузить проверку от спама. Попробуй позднее.",true);
      document.head.appendChild(script);
      await loadList();
    } catch {
      statusMessage("Приём жалоб на сайте готовится к запуску. Пока обратись в Discord поддержки.",true);
      feedback.textContent = "Публичные обращения временно недоступны до подключения базы форума.";
      send.disabled = true;
    }
  }
  function changeType() {
    const type = form.elements.type.value;
    const targetLabel = document.getElementById("sl-target-label");
    const label = type === "staff" ? "Ник модератора" : type === "appeal" ? "Ник или причина наказания" : "Ник нарушителя";
    targetLabel.firstChild.textContent = label + " ";
  }
  form.elements.type.addEventListener("change",changeType);
  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (!connected || send.disabled || !form.reportValidity()) return;
    const token = window.turnstile && turnstileId !== null ? window.turnstile.getResponse(turnstileId) : "";
    if (!token) return statusMessage("Пройди проверку от спама.", true);
    const data = Object.fromEntries(new FormData(form).entries());
    data.turnstile = token;
    send.disabled = true;
    statusMessage("Отправляем обращение...");
    try {
      const out = await api("/api/complaints", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      form.reset(); changeType();
      statusMessage("Жалоба принята и ожидает проверки модератором.");
      receipt.hidden = false;
      receipt.replaceChildren();
      const h = textNode("strong","","✅ Жалоба #" + out.id + " принята");
      const p = textNode("p","","Сохрани код: он нужен для просмотра статуса. Не передавай его посторонним.");
      const code = textNode("code","sl-receipt-code",out.code);
      const url = new URL(location.href);
      url.searchParams.set("ticket",out.id);
      url.searchParams.set("code",out.code);
      const a = textNode("a","","Сохранить ссылку на статус →");
      a.href = url.toString();
      a.rel = "noopener noreferrer";
      receipt.append(h,p,code,a);
    } catch(error) {statusMessage(error.message || "Не удалось отправить жалобу.", true);}
    finally {send.disabled = false; if(window.turnstile && turnstileId !== null)window.turnstile.reset(turnstileId);}
  });
  lookup.addEventListener("submit",async event => {
    event.preventDefault();
    if (!lookup.reportValidity()) return;
    const id=lookup.elements.id.value;
    const code=lookup.elements.code.value;
    lookupResult.textContent="Проверяем...";
    try {
      const item=await api("/api/complaints/"+encodeURIComponent(id)+"?code="+encodeURIComponent(code));
      lookupResult.replaceChildren(textNode("strong","", "Заявка #" + item.id + " — " + (statuses[item.state] || item.state)),textNode("p","",item.subject));
      if(item.reply)lookupResult.append(textNode("p","", "Ответ администрации: " + item.reply));
    } catch (error){lookupResult.textContent=error.message||"Обращение не найдено.";}
  });
  const q = new URLSearchParams(location.search);
  if(q.has("ticket") && q.has("code")){
    lookup.elements.id.value=q.get("ticket");
    lookup.elements.code.value=q.get("code");
    setTimeout(()=>lookup.requestSubmit(),1000);
  }
  async function loadList() {
    try {
      const data = await api("/api/complaints");
      entries = Array.isArray(data.items) ? data.items : [];
      draw();
    }catch {feedback.textContent="Не удалось загрузить список обращений.";list.replaceChildren();}
  }
  function draw() {
    list.replaceChildren();
    const term=search.value.trim().toLocaleLowerCase("ru-RU");
    const shown=entries.filter(e => (status.value==="all" || e.state===status.value) &&
      (!term || ("#" + e.id + " " + e.subject + " " + e.nickname).toLocaleLowerCase("ru-RU").includes(term)));
    feedback.textContent = shown.length ? "Обращений найдено: " + shown.length : "Пока нет опубликованных жалоб с такими параметрами.";
    for(const e of shown) {
      const card=document.createElement("article");card.className="sl-forum-item";
      const body=document.createElement("div");body.className="sl-forum-item-body";
      body.append(textNode("span","sl-forum-item-title","#"+e.id+" · "+e.subject),textNode("span","sl-forum-item-meta",e.nickname+" · "+fmtDate(e.created_at)));
      if(e.reply)body.append(textNode("span","sl-forum-item-meta","Ответ модерации: "+e.reply));
      card.append(body,textNode("span","sl-forum-status"+(e.state==="closed"?" closed":""),statuses[e.state]||e.state));
      list.append(card);
    }
  }
  search.addEventListener("input",draw);
  status.addEventListener("change",draw);
  refresh.addEventListener("click",loadList);
  init();
})();
