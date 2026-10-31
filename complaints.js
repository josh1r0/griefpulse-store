/* Public ShadowLand complaints board — uses anonymous read-only GitHub Issues API. */
(() => {
  "use strict";
  const ENDPOINT = "https://api.github.com/repos/josh1r0/griefpulse-store/issues?state=all&sort=created&direction=desc&per_page=100";
  const list = document.getElementById("complaints-list");
  const feedback = document.getElementById("complaints-feedback");
  const search = document.getElementById("complaints-search");
  const status = document.getElementById("complaints-status");
  const refresh = document.getElementById("complaints-refresh");
  if (!list || !feedback || !search || !status || !refresh) return;
  let items = [];
  const isComplaint = issue => /^\[(жалоба на игрока|жалоба на модератора|обжалование)\]/i.test(issue.title || "");
  const formatDate = date => {
    try { return new Intl.DateTimeFormat("ru-RU",{day:"2-digit",month:"long",year:"numeric"}).format(new Date(date)); }
    catch { return "Дата не указана"; }
  };
  const safeUrl = url => typeof url === "string" && /^https:\/\/github\.com\/josh1r0\/griefpulse-store\/issues\/\d+$/.test(url) ? url : "https://github.com/josh1r0/griefpulse-store/issues";
  function render() {
    list.replaceChildren();
    const q = search.value.trim().toLocaleLowerCase("ru-RU");
    const filtered = items.filter(issue =>
      (status.value === "all" || issue.state === status.value) &&
      (!q || String(issue.number).includes(q) || issue.title.toLocaleLowerCase("ru-RU").includes(q))
    );
    if (!filtered.length) {
      feedback.textContent = items.length ? "По этому запросу обращений пока нет." : "Пока нет опубликованных жалоб. Ты можешь создать первое обращение.";
      return;
    }
    feedback.textContent = "Найдено обращений: " + filtered.length + ".";
    for (const issue of filtered) {
      const a = document.createElement("a");
      a.className = "sl-forum-item";
      a.href = safeUrl(issue.html_url);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      const body = document.createElement("div");
      body.className = "sl-forum-item-body";
      const title = document.createElement("span");
      title.className = "sl-forum-item-title";
      title.textContent = issue.title || "Без названия";
      const meta = document.createElement("span");
      meta.className = "sl-forum-item-meta";
      const label = document.createElement("span");
      label.textContent = "#" + issue.number + " · " + formatDate(issue.created_at);
      const replies = document.createElement("span");
      replies.textContent = "Ответов: " + (Number(issue.comments) || 0);
      meta.append(label,replies);
      body.append(title,meta);
      const badge = document.createElement("span");
      badge.className = "sl-forum-status" + (issue.state === "closed" ? " closed" : "");
      badge.textContent = issue.state === "closed" ? "Закрыта" : "На рассмотрении";
      a.append(body,badge);
      list.append(a);
    }
  }
  async function load() {
    refresh.disabled = true;
    feedback.textContent = "Загружаем жалобы...";
    try {
      const response = await fetch(ENDPOINT, {headers:{"Accept":"application/vnd.github+json"}});
      if (!response.ok) throw new Error("GitHub API: " + response.status);
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error("Некорректный ответ");
      items = data.filter(issue => !issue.pull_request && isComplaint(issue));
      render();
    } catch (error) {
      list.replaceChildren();
      feedback.textContent = "Не удалось загрузить список обращений. Открой их напрямую на GitHub по ссылке «Все обращения» выше.";
    } finally {
      refresh.disabled = false;
    }
  }
  search.addEventListener("input", render);
  status.addEventListener("change", render);
  refresh.addEventListener("click", load);
  load();
})();
