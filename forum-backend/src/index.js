/* ShadowLand complaints API: Cloudflare Worker + D1 + Turnstile */
const ALLOW=["https://shadowland.land","https://www.shadowland.land"];
const STATES=["pending","open","review","closed","rejected"];
const TYPES=["player","staff","appeal"];
function cors(req){
  const origin=req.headers.get("Origin");
  const h={"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Access-Control-Allow-Methods":"GET,POST,PATCH,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization","Vary":"Origin"};
  if(origin && ALLOW.includes(origin))h["Access-Control-Allow-Origin"]=origin;
  return h;
}
const json=(req,x,status=200)=>new Response(JSON.stringify(x),{status,headers:cors(req)});
const err=(req,s,status=400)=>json(req,{error:s},status);
const str=(s,max)=>typeof s==="string"?s.trim().slice(0,max+1):"";
async function sha(text){const d=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));return Array.from(new Uint8Array(d),x=>x.toString(16).padStart(2,"0")).join("");}
async function verifyCaptcha(env,token,ip){
  if(!token||!env.TURNSTILE_SECRET)return false;
  const body=new FormData();body.append("secret",env.TURNSTILE_SECRET);body.append("response",token);if(ip)body.append("remoteip",ip);
  try{
    const res=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body,signal:AbortSignal.timeout(10000)});
    const data=await res.json();
    return data.success===true && ["shadowland.land","www.shadowland.land"].includes(data.hostname);
  }catch{return false;}
}
const authorized=(req,env)=>!!env.ADMIN_TOKEN && env.ADMIN_TOKEN.length>=24 && req.headers.get("Authorization")==="Bearer "+env.ADMIN_TOKEN;
const publicEntry=(x)=>({id:x.id,type:x.type,nickname:x.nickname,subject:x.subject,state:x.state,reply:x.reply,created_at:x.created_at,updated_at:x.updated_at});
const fullEntry=(x)=>({...publicEntry(x),target:x.target,rule:x.rule,details:x.details,evidence:x.evidence,public:Boolean(x.public)});
export default {
  async fetch(req,env){
    try{
      const origin=req.headers.get("Origin");
      if(origin&&!ALLOW.includes(origin))return err(req,"Недопустимый сайт-источник.",403);
      if(req.method==="OPTIONS")return new Response(null,{status:204,headers:cors(req)});
      const u=new URL(req.url);const path=u.pathname.replace(/\/+$/,"")||"/";
      if(path==="/api/config"&&req.method==="GET")return json(req,{configured:Boolean(env.DB&&env.ADMIN_TOKEN&&env.TURNSTILE_SECRET&&env.TURNSTILE_SITEKEY),sitekey:env.TURNSTILE_SITEKEY||""});
      if(!env.DB)return err(req,"База форума ещё не подключена.",503);
      if(path==="/api/complaints"&&req.method==="GET"){
        const rows=await env.DB.prepare("SELECT id,type,nickname,subject,state,reply,created_at,updated_at FROM complaints WHERE public=1 AND state IN ('open','review','closed') ORDER BY id DESC LIMIT 100").all();
        return json(req,{items:(rows.results||[]).map(publicEntry)});
      }
      const detail=path.match(/^\/api\/complaints\/(\d+)$/);
      if(detail&&req.method==="GET"){
        const row=await env.DB.prepare("SELECT * FROM complaints WHERE id=?").bind(Number(detail[1])).first();
        if(!row)return err(req,"Обращение не найдено.",404);
        const code=u.searchParams.get("code")||"";
        const accepted=code.length>=20&&(await sha(code))===row.receipt_hash;
        if(accepted)return json(req,fullEntry(row));
        if(row.public&&["open","review","closed"].includes(row.state))return json(req,publicEntry(row));
        return err(req,"Неверный номер или код.",404);
      }
      if(path==="/api/complaints"&&req.method==="POST"){
        if(!env.ADMIN_TOKEN||!env.TURNSTILE_SECRET||!env.TURNSTILE_SITEKEY)return err(req,"Приём жалоб ещё не настроен.",503);
        if(!req.headers.get("Content-Type")?.includes("application/json"))return err(req,"Ожидается JSON.",415);
        const size=Number(req.headers.get("content-length")||0);if(size>9000)return err(req,"Слишком большие данные.",413);
        let data;try{data=await req.json();}catch{return err(req,"Неверный формат данных.");}
        if(!data||typeof data!=="object")return err(req,"Пустое обращение.");
        const type=str(data.type,20),nickname=str(data.nickname,16),target=str(data.target,60);
        const subject=str(data.subject,120),rule=str(data.rule,100),details=str(data.details,2500);
        const evidence=str(data.evidence,1200),token=str(data.turnstile,2200);
        if(!TYPES.includes(type))return err(req,"Выбери тип обращения.");
        if(!/^[A-Za-z0-9_]{3,16}$/.test(nickname))return err(req,"Неверный Minecraft-ник.");
        if(target.length<2||target.length>60)return err(req,"Укажи ник нарушителя или причину наказания.");
        if(subject.length<5||subject.length>120||details.length<30||details.length>2500)return err(req,"Заполни тему и описание подробнее.");
        if(rule.length>100||evidence.length>1200)return err(req,"Слишком длинное поле.");
        if(evidence&&evidence.split(/\s+/).some(x=>x&&!/^https:\/\/\S+$/i.test(x)))return err(req,"Доказательства — только HTTPS-ссылки.");
        const ip=req.headers.get("CF-Connecting-IP")||"unknown";
        if(!await verifyCaptcha(env,token,ip))return err(req,"Не пройдена проверка от спама.");
        const ipHash=await sha(env.ADMIN_TOKEN+":"+ip),now=Date.now();
        const count=await env.DB.prepare("SELECT COUNT(*) AS total FROM rate_limits WHERE ip_hash=? AND created_at>?").bind(ipHash,now-3600000).first();
        if(Number(count?.total||0)>=3)return err(req,"Не более трёх жалоб в час.",429);
        const code=crypto.randomUUID()+"-"+crypto.randomUUID();
        const hash=await sha(code);
        const result=await env.DB.prepare("INSERT INTO complaints (type,nickname,target,rule,subject,details,evidence,state,public,reply,receipt_hash,created_at,updated_at) VALUES (?,?,?,?,?,?,?,'pending',0,'',?,?,?)").bind(type,nickname,target,rule,subject,details,evidence,hash,now,now).run();
        await env.DB.prepare("INSERT INTO rate_limits (ip_hash,created_at) VALUES (?,?)").bind(ipHash,now).run();
        return json(req,{id:result.meta.last_row_id,code,state:"pending"},201);
      }
      if(path==="/api/admin/complaints"&&req.method==="GET"){
        if(!authorized(req,env))return err(req,"Недостаточно прав.",401);
        const rows=await env.DB.prepare("SELECT * FROM complaints ORDER BY id DESC LIMIT 100").all();
        return json(req,{items:(rows.results||[]).map(fullEntry)});
      }
      const admin=path.match(/^\/api\/admin\/complaints\/(\d+)$/);
      if(admin&&req.method==="PATCH"){
        if(!authorized(req,env))return err(req,"Недостаточно прав.",401);
        let data;try{data=await req.json();}catch{return err(req,"Неверный формат.");}
        if(!data||!STATES.includes(data.state)||typeof data.public!=="boolean"||typeof data.reply!=="string"||data.reply.length>1500)return err(req,"Неверные поля статуса.");
        const published=data.public&&!["pending","rejected"].includes(data.state)?1:0;
        const out=await env.DB.prepare("UPDATE complaints SET state=?,public=?,reply=?,updated_at=? WHERE id=?").bind(data.state,published,data.reply,Date.now(),Number(admin[1])).run();
        if(!out.meta.changes)return err(req,"Обращение не найдено.",404);
        return json(req,{ok:true});
      }
      return err(req,"Адрес не найден.",404);
    }catch(e){console.error("forum",e);return err(req,"Ошибка сервера форума.",500);}
  }
};
