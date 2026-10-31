"use strict";
(() => {
  const API="https://forum-api.shadowland.land";
  const login=document.getElementById("sl-admin-login");
  const status=document.getElementById("sl-admin-status");
  const root=document.getElementById("sl-admin-list");
  let token="";
  function t(tag,value){const el=document.createElement(tag);el.textContent=value;return el;}
  async function api(path,options={}) {
    const res=await fetch(API+path,{...options,headers:{"Authorization":"Bearer "+token,...options.headers}});
    const data=await res.json().catch(()=>({}));
    if(!res.ok)throw Error(data.error||"Ошибка сервера "+res.status);
    return data;
  }
  function render(items){
    root.replaceChildren();
    if(!items.length){root.append(t("p","Обращений пока нет."));return;}
    for(const c of items){
      const box=document.createElement("article");box.className="sl-complaint-panel";
      box.append(t("h2","#"+c.id+" · "+c.subject),t("p","Игрок: "+c.nickname+" | Тип: "+c.type+" | Указан: "+c.target+" | "+c.created_at));
      box.append(t("p","Пункт/причина: "+(c.rule||"—")),t("p","Описание: "+c.details),t("p","Доказательства: "+(c.evidence||"—")));
      const form=document.createElement("form");
      form.className="sl-admin-editor";
      const label=t("label","Статус");const sel=document.createElement("select");
      for(const [value,caption] of [["pending","Ожидает проверки"],["open","Открыта"],["review","На рассмотрении"],["closed","Закрыта"],["rejected","Отклонена"]]){
        const option=document.createElement("option");option.value=value;option.textContent=caption;if(c.state===value)option.selected=true;sel.append(option);
      }
      label.append(sel);
      const visibility=t("label"," Показать на форуме");
      const boxChecked=document.createElement("input");boxChecked.type="checkbox";boxChecked.checked=!!c.public;visibility.prepend(boxChecked);
      const replyLabel=t("label","Ответ модерации");const textarea=document.createElement("textarea");
      textarea.maxLength=1500;textarea.rows=3;textarea.value=c.reply||"";replyLabel.append(textarea);
      const save=t("button","Сохранить");save.type="submit";
      const feedback=t("span","");
      form.append(label,visibility,replyLabel,save,feedback);
      form.addEventListener("submit",async e=>{
        e.preventDefault();save.disabled=true;feedback.textContent="Сохраняем...";
        try {await api("/api/admin/complaints/"+c.id,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({state:sel.value,public:boxChecked.checked,reply:textarea.value})});feedback.textContent="Сохранено";}
        catch(err){feedback.textContent=err.message;} finally{save.disabled=false;}
      });
      box.append(form);root.append(box);
    }
  }
  login.addEventListener("submit",async e=>{
    e.preventDefault();token=login.elements.token.value;
    status.textContent="Загружаем обращения...";
    try {const data=await api("/api/admin/complaints");render(data.items||[]);status.textContent="Загружено обращений: "+(data.items||[]).length;}
    catch(err){status.textContent=err.message||"Ошибка входа";root.replaceChildren();token="";}
    finally {login.elements.token.value="";}
  });
})();
