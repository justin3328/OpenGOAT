#!/usr/bin/env node
import{Command as Ao}from"commander";import{useState as Pe,useEffect as $t}from"react";import{render as Ut,Box as ae,Text as X,useApp as Vt,useInput as Xt}from"ink";import He from"inquirer";import we from"crypto";import Ue from"os";import tt from"path";import de from"fs";var Ve=tt.join(Ue.homedir(),".opengoat"),Xe=tt.join(Ve,"vault.enc"),ot="aes-256-cbc";function rt(){let o=`${Ue.hostname()}::${Ue.userInfo().username}::opengoat-v1`;return we.createHash("sha256").update(o).digest()}function $e(){try{if(!de.existsSync(Xe))return{};let o=de.readFileSync(Xe,"utf-8"),{iv:e,data:t}=JSON.parse(o),r=rt(),n=we.createDecipheriv(ot,r,Buffer.from(e,"hex")),a=n.update(t,"hex","utf-8")+n.final("utf-8");return JSON.parse(a)}catch{return{}}}function et(o){de.existsSync(Ve)||de.mkdirSync(Ve,{recursive:!0});let e=rt(),t=we.randomBytes(16),r=we.createCipheriv(ot,e,t),n=r.update(JSON.stringify(o),"utf-8","hex")+r.final("hex");de.writeFileSync(Xe,JSON.stringify({iv:t.toString("hex"),data:n}),"utf-8")}var V={set(o,e,t){let r=$e();r[`${o}::${e}`]=t,et(r)},get(o,e){let t=`OPENGOAT_API_KEY_${e.toUpperCase()}`;return process.env[t]?process.env[t]:$e()[`${o}::${e}`]||null},delete(o,e){let t=$e();delete t[`${o}::${e}`],et(t)},has(o,e){return this.get(o,e)!==null}};import Nt from"conf";var Ye=class{name="DefaultConf";version="1.0.0";store;constructor(){this.store=new Nt({projectName:"opengoat"})}async initialize(){}async get(e){return this.store.get(e)||null}async set(e,t){this.store.set(e,t)}async delete(e){this.store.delete(e)}async query(e,t){return[]}async transaction(e){return e()}async close(){}getAll(){return this.store.store}},g=new Ye;import _t from"better-sqlite3";import nt from"path";import{fileURLToPath as Ct}from"url";var Go=nt.dirname(Ct(import.meta.url)),We=class{static instance=null;static getInstance(){if(!this.instance){let e=nt.join(process.cwd(),"opengoat.db");this.instance=new _t(e),this.instance.exec(`
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

CREATE TABLE IF NOT EXISTS goals (
  id            TEXT PRIMARY KEY,
  statement     TEXT NOT NULL,
  category      TEXT NOT NULL,
  current_val   REAL NOT NULL,
  target_val    REAL NOT NULL,
  unit          TEXT NOT NULL,
  deadline      TEXT NOT NULL,
  active_path   TEXT,
  status        TEXT DEFAULT 'active',
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS resource_profiles (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  profile       TEXT NOT NULL,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS paths (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  data          TEXT NOT NULL,
  rank          INTEGER NOT NULL,
  is_active     INTEGER DEFAULT 0,
  generated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS gap_log (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  value         REAL NOT NULL,
  note          TEXT,
  logged_at     TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS interventions (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  trigger_type  TEXT NOT NULL,
  question      TEXT NOT NULL,
  user_response TEXT,
  constraint_type TEXT,
  unlock_action TEXT,
  resolved      INTEGER DEFAULT 0,
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS week_scores (
  id            TEXT PRIMARY KEY,
  goal_id       TEXT NOT NULL REFERENCES goals(id),
  week_number   INTEGER NOT NULL,
  velocity_score REAL NOT NULL,
  consistency   REAL NOT NULL,
  momentum      REAL NOT NULL,
  path_fit      REAL NOT NULL,
  total         REAL NOT NULL,
  rank          TEXT NOT NULL,
  xp            INTEGER NOT NULL,
  gap_at_week   REAL,
  scored_at     TEXT DEFAULT (datetime('now')),
  UNIQUE(goal_id, week_number)
);

CREATE TABLE IF NOT EXISTS plugin_registry (
  name          TEXT PRIMARY KEY,
  version       TEXT NOT NULL,
  type          TEXT NOT NULL,
  manifest      TEXT NOT NULL,
  installed_at  TEXT DEFAULT (datetime('now'))
);
`)}return this.instance}},h=()=>We.getInstance();import{v4 as Dt}from"uuid";var f=class{static create(e){let t=h(),r=Dt();return t.prepare(`
      INSERT INTO goals (id, statement, category, current_val, target_val, unit, deadline, active_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(r,e.statement,e.category,e.currentVal,e.targetVal,e.unit,e.deadline,e.activePath||null),r}static getAllActive(){return h().prepare('SELECT * FROM goals WHERE status = "active"').all().map(r=>({id:r.id,statement:r.statement,category:r.category,currentVal:r.current_val,targetVal:r.target_val,unit:r.unit,deadline:r.deadline,activePath:r.active_path,status:r.status,createdAt:new Date(r.created_at+"Z")}))}static getById(e){let r=h().prepare("SELECT * FROM goals WHERE id = ?").get(e);return r?{id:r.id,statement:r.statement,category:r.category,currentVal:r.current_val,targetVal:r.target_val,unit:r.unit,deadline:r.deadline,activePath:r.active_path,status:r.status,createdAt:new Date(r.created_at+"Z")}:null}static updateCurrentValue(e,t){h().prepare('UPDATE goals SET current_val = ?, updated_at = datetime("now") WHERE id = ?').run(t,e)}static updatePath(e,t){h().prepare('UPDATE goals SET active_path = ?, updated_at = datetime("now") WHERE id = ?').run(t,e)}};import{v4 as Lt}from"uuid";var z=class{static save(e,t){let r=h();this.getByGoalId(e)?r.prepare(`
        UPDATE resource_profiles 
        SET profile = ?, updated_at = datetime('now')
        WHERE goal_id = ?
      `).run(JSON.stringify(t),e):r.prepare(`
        INSERT INTO resource_profiles (id, goal_id, profile)
        VALUES (?, ?, ?)
      `).run(Lt(),e,JSON.stringify(t))}static getByGoalId(e){let r=h().prepare("SELECT profile FROM resource_profiles WHERE goal_id = ?").get(e);return r?JSON.parse(r.profile):null}};var R=class{static savePaths(e,t){let r=h(),n=r.prepare(`
      INSERT OR REPLACE INTO paths (id, goal_id, data, rank, is_active)
      VALUES (?, ?, ?, ?, ?)
    `);r.transaction(()=>{r.prepare("DELETE FROM paths WHERE goal_id = ?").run(e),t.forEach(a=>{n.run(a.id,e,JSON.stringify(a),a.rank,0)})})()}static activatePath(e,t){let r=h();r.transaction(()=>{r.prepare("UPDATE paths SET is_active = 0 WHERE goal_id = ?").run(e),r.prepare("UPDATE paths SET is_active = 1 WHERE id = ?").run(t),r.prepare("UPDATE goals SET active_path = ? WHERE id = ?").run(t,e)})()}static getForGoal(e){return h().prepare("SELECT * FROM paths WHERE goal_id = ? ORDER BY rank ASC").all(e).map(n=>({...JSON.parse(n.data),id:n.id,rank:n.rank,isActive:n.is_active===1}))}static getActivePath(e){let r=h().prepare("SELECT * FROM paths WHERE goal_id = ? AND is_active = 1 LIMIT 1").get(e);return r?{...JSON.parse(r.data),id:r.id,rank:r.rank}:null}};var Z=class{static generateGoalExtractionPrompt(e){return`
You are GoatBrain, the OpenGOAT intent parser.
Extract the structured goal data from this natural language statement:
"${e}"

Rules:
- Current value is usually 0 unless implied otherwise.
- Infer the category (e.g. income, fitness, learning, audience, product).
- If unit is implied as currency, use '$' or the specified currency.
- If deadline is implied (e.g. "by august"), calculate the exact YYYY-MM-DD representing the end of that period for the year 2026.

Return exactly this JSON interface:
{
  "statement": "${e}",
  "category": "string",
  "currentVal": 0,
  "targetVal": number,
  "unit": "string",
  "deadline": "YYYY-MM-DD"
}

Output JSON only. No markdown. No intro.
`}static generateProfileExtractionPrompt(e){return`
You are GoatBrain, mapping a user's organic answers into a strict 5D Resource Profile.

Here are the user's answers to the 5 dimensions:
Time: "${e.time}"
Capital: "${e.capital}"
Skills: "${e.skills}"
Network: "${e.network}"
Assets: "${e.assets}"

Parse these answers directly into this strict JSON schema. Extract numbers intelligently.
If an array is requested, split their answers logically.

interface ResourceProfile {
  time: {
    hoursPerDay: number;
    peakHours: 'morning' | 'afternoon' | 'evening';
    daysPerWeek: number;
    hardConstraints: string[];
  };
  capital: {
    deployable: number;
    monthlyIncome: number;
    runway: number;
    willingToSpend: boolean;
  };
  skills: string[];
  tools: string[];
  triedBefore: string[];
  unfairAdvantage: string;
  network: {
    hasExistingAudience: boolean;
    audienceSize: number;
    platforms: string[];
    keyConnections: string[];
    communities: string[];
  };
  assets: string[];
}

Return ONLY the valid JSON object matching the ResourceProfile layout. No markdown context.
`}};var ne=class{static generatePrompt(e,t){return`
You are GoatBrain \u2014 the intelligence engine of OpenGOAT.
A person has a goal and a specific set of resources.
Your job: generate exactly 5 paths to close their gap.

CRITICAL RULES:
- Every path must be built around THEIR specific resources
- Rank by one metric only: speed to close the gap given what they have NOW
- Be brutally honest about skill gaps and resource mismatches
- The #1 path must be startable within 2 hours with zero additional resources
- Never generate generic advice. Specific means specific.
- Include a first action for each path that takes under 2 hours
- Return ONLY valid JSON. Zero markdown. Zero explanation.

Goal: ${e.statement}
Current: ${e.currentVal} ${e.unit}
Target: ${e.targetVal} ${e.unit}
Deadline: ${e.deadline}
Resource profile: ${JSON.stringify(t,null,2)}

Generate 5 paths as a JSON array matching exactly this TypeScript interface:
interface Path {
  id: string; // generate a random uuid string
  name: string;
  tagline: string;
  whyFastest: string;
  confidenceScore: number;
  weeksToClose: number;
  weeklyHoursRequired: number;
  capitalRequired: number;
  skillGaps: string[];
  resourceFit: { time: string, capital: string, skills: string, network: string, overall: number };
  milestones: { week: number, description: string, metric: number, unit: string }[];
  firstAction: { description: string, timeRequired: number, output: string };
  rank: 1 | 2 | 3 | 4 | 5;
}

Output JSON array only. No code blocks. No intro.
`}};import Bt from"@anthropic-ai/sdk";var be=class{supportsStreaming=!0;name="anthropic";version="1.0.0";client;constructor(e){this.client=new Bt({apiKey:e})}async complete(e,t){let n=(await this.client.messages.create({model:t?.model||"claude-3-opus-20240229",max_tokens:t?.maxTokens||1024,system:t?.systemPrompt,messages:[{role:"user",content:e}]})).content[0];return n.type==="text"?n.text:""}async*stream(e,t){yield await this.complete(e,t)}};import Gt from"openai";var Re=class{supportsStreaming=!0;name="openai";version="1.0.0";client;constructor(e){this.client=new Gt({apiKey:e})}async complete(e,t){return(await this.client.chat.completions.create({model:t?.model||"gpt-4o",messages:[{role:"system",content:t?.systemPrompt||""},{role:"user",content:e}],max_tokens:t?.maxTokens,temperature:t?.temperature})).choices[0]?.message?.content||""}async*stream(e,t){yield await this.complete(e,t)}};import Mt from"groq-sdk";var Se=class{supportsStreaming=!0;name="groq";version="1.0.0";client;constructor(e){this.client=new Mt({apiKey:e})}async complete(e,t){return(await this.client.chat.completions.create({model:t?.model||"llama-3.3-70b-versatile",messages:[{role:"system",content:t?.systemPrompt||""},{role:"user",content:e}]})).choices[0]?.message?.content||""}async*stream(e,t){yield await this.complete(e,t)}};var Ae=class{supportsStreaming=!0;name="ollama";version="1.0.0";baseUrl;constructor(e="http://localhost:11434"){this.baseUrl=e}async complete(e,t){return(await(await fetch(`${this.baseUrl}/api/generate`,{method:"POST",body:JSON.stringify({model:t?.model||"llama2",prompt:e,system:t?.systemPrompt,stream:!1})})).json()).response||""}async*stream(e,t){yield await this.complete(e,t)}};var Ft={groq:"llama-3.3-70b-versatile",anthropic:"claude-3-5-haiku-20241022",openai:"gpt-4o-mini",ollama:"llama3.1"};async function M(o){let e=o.toLowerCase();if(e.includes("ollama"))return new Ae;let t=V.get("opengoat",e);if(!t)throw new Error(`No API key found for "${o}".
  Option 1: Run \`opengoat init\` to set up your provider.
  Option 2: Set the env var OPENGOAT_API_KEY_${e.toUpperCase()}=<your-key>`);if(e.includes("anthropic"))return process.env.ANTHROPIC_API_KEY=t,new be(t);if(e.includes("openai"))return process.env.OPENAI_API_KEY=t,new Re(t);if(e.includes("groq"))return process.env.GROQ_API_KEY=t,new Se(t);throw new Error(`Unknown provider: ${o}`)}async function L(o,e){try{let t=Ft[o.name.toLowerCase()]||"gpt-4o-mini";return await o.complete(e,{model:t})}catch(t){return console.error(`
[BRAIN OFFLINE] AI Model Inference Failed: ${t.message}`),""}}import{jsx as _,jsxs as Oe}from"react/jsx-runtime";async function at(){console.log("\x1B[2J\x1B[0;0H");let o=await He.prompt([{name:"statement",message:"What is your goal (in plain English)?"},{name:"current",message:"What is your current number/value today?",validate:r=>!isNaN(Number(r))||"Enter a number"},{type:"list",name:"provider",message:"Select Intelligence layer:",choices:["Anthropic","OpenAI","Groq","Ollama (Local)"]}]);if(o.provider!=="Ollama (Local)"){let{apiKey:r}=await He.prompt([{type:"password",name:"apiKey",message:`Enter your ${o.provider} API Key:`}]);V.set("opengoat",o.provider.toLowerCase(),r)}await g.set("preferred_provider",o.provider),console.log(`
--- GoatBrain 5D Resource Mapping ---`);let e=await He.prompt([{name:"time",message:"[Time] How many hours/day genuinely available? Peak hours? Days/week?"},{name:"capital",message:"[Capital] Deployable cash right now? Monthly income? Willing to spend?"},{name:"skills",message:"[Skills] What do you do well? Tools you use? Unfair advantage?"},{name:"network",message:"[Network] Existing audience? Connections who have done this?"},{name:"assets",message:"[Assets] Existing code, content, reputation, zero-cost leverage?"}]),{waitUntilExit:t}=Ut(_(Yt,{base:o,resources:e}));await t()}var Yt=({base:o,resources:e})=>{let{exit:t}=Vt(),[r,n]=Pe("Booting GoatBrain..."),[a,i]=Pe([]),[s,l]=Pe(0),[c,p]=Pe(null);return $t(()=>{async function m(){try{let y=await M(o.provider);n("Parsing natural language goal constraints...");let T=Z.generateGoalExtractionPrompt(o.statement),C=await L(y,T),N=JSON.parse(C.replace(/```json|```/g,"").trim());n("Mapping 5D organic resource profile...");let J=Z.generateProfileExtractionPrompt(e),re=await L(y,J),U=JSON.parse(re.replace(/```json|```/g,"").trim()),v=f.create({statement:N.statement,category:N.category||"unknown",currentVal:Number(o.current),targetVal:N.targetVal,unit:N.unit,deadline:N.deadline});z.save(v,U),n("Calculating top 5 fastest paths based on resources...");let K=ne.generatePrompt(f.getById(v),U),Qe=await L(y,K),ve=JSON.parse(Qe.replace(/```json|```/g,"").trim());R.savePaths(v,ve),n("COMPLETE"),i(ve),g.set("active_goal_id",v)}catch(y){n(`FAILED: ${y.message}`)}}m()},[]),Xt((m,y)=>{if(!(r!=="COMPLETE"&&!c)){if(y.upArrow&&s>0&&l(s-1),y.downArrow&&s<a.length-1&&l(s+1),y.return&&!c){let T=a[s],C=g.get("active_goal_id");(async()=>{let N=await g.get("active_goal_id");R.activatePath(N,T.id),p(T)})()}m==="q"&&t()}}),c?Oe(ae,{flexDirection:"column",padding:1,borderStyle:"round",borderColor:"green",children:[Oe(X,{bold:!0,color:"green",children:["PATH LOCKED: ",c.name]}),_(ae,{marginY:1,children:_(X,{dimColor:!0,children:c.whyFastest})}),_(X,{bold:!0,color:"yellow",children:"First Action (Next 2 hours):"}),_(X,{children:c.firstAction.description}),_(ae,{marginTop:1,children:_(X,{dimColor:!0,children:"Run 'opengoat paths' to view all options. Run 'opengoat log' to update your gap. Press Q to exit."})})]}):r!=="COMPLETE"?_(ae,{padding:1,children:_(X,{children:r})}):Oe(ae,{flexDirection:"column",padding:1,children:[_(X,{bold:!0,color:"cyan",children:"GOATBRAIN TOP 5 PATHS"}),_(X,{dimColor:!0,children:"Select your operating context (Up/Down + Enter)"}),_(ae,{flexDirection:"column",marginY:1,children:a.map((m,y)=>Oe(X,{color:y===s?"green":"white",children:[y===s?"\u276F ":"  ",m.rank,". ",m.name," \u2014 ",m.weeksToClose," weeks (",Math.round(m.confidenceScore),"% confidence)"]},y))})]})};import{v4 as Wt}from"uuid";var b=class{static log(e,t,r){let n=h(),a=Wt();return n.prepare(`
      INSERT INTO gap_log (id, goal_id, value, note)
      VALUES (?, ?, ?, ?)
    `).run(a,e,t,r||null),{id:a,goalId:e,value:t,loggedAt:new Date,note:r}}static getSeries(e){return h().prepare("SELECT * FROM gap_log WHERE goal_id = ? ORDER BY logged_at ASC").all(e).map(n=>({id:n.id,goalId:n.goal_id,value:n.value,note:n.note,loggedAt:new Date(n.logged_at+"Z")}))}static getLatest(e){let r=h().prepare("SELECT * FROM gap_log WHERE goal_id = ? ORDER BY logged_at DESC LIMIT 1").get(e);return r?{id:r.id,goalId:r.goal_id,value:r.value,note:r.note,loggedAt:new Date(r.logged_at+"Z")}:null}};var me=class{static evaluateGap(e){let t=e.targetVelocity>0?e.velocity7d/e.targetVelocity:1;return e.daysSinceMovement>=5||t<.4&&e.isBehindSchedule?"intervening":e.daysSinceMovement>=2||t<.6?"watching":"silent"}static generateWatchingQuestion(e){let t=Math.floor(e.daysSinceMovement);return t>=2?`Your gap hasn't moved in ${t} days. What is the single thing blocking you right now?`:`Your velocity dropped ${Math.round((1-e.velocity7d/e.targetVelocity)*100)}% below target. What is the constraint right now?`}};import{v4 as Ht}from"uuid";var ie=class{static create(e){let t=h(),r=Ht();return t.prepare(`
      INSERT INTO interventions (id, goal_id, trigger_type, question, user_response, constraint_type, unlock_action)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(r,e.goalId,e.triggeredBy,e.question,e.userResponse||null,e.constraintType||null,e.unlockAction||null),{...e,id:r,createdAt:new Date,resolved:!1}}static update(e,t){let r=h(),n=[],a=[];t.userResponse!==void 0&&(n.push("user_response = ?"),a.push(t.userResponse)),t.constraintType!==void 0&&(n.push("constraint_type = ?"),a.push(t.constraintType)),t.unlockAction!==void 0&&(n.push("unlock_action = ?"),a.push(t.unlockAction)),t.resolved!==void 0&&(n.push("resolved = ?"),a.push(t.resolved?1:0)),n.length!==0&&(a.push(e),r.prepare(`
      UPDATE interventions SET ${n.join(", ")} WHERE id = ?
    `).run(...a))}static getUnresolved(e){return h().prepare("SELECT * FROM interventions WHERE goal_id = ? AND resolved = 0").all(e).map(n=>({id:n.id,goalId:n.goal_id,triggeredBy:n.trigger_type,question:n.question,userResponse:n.user_response,constraintType:n.constraint_type,unlockAction:n.unlock_action,createdAt:new Date(n.created_at+"Z"),resolved:n.resolved===1}))}};import ge from"chalk";async function it(o){let e=await g.get("active_goal_id");if(!e){console.log(ge.red("No active goal. Run `opengoat init` first."));return}let t=f.getById(e);if(!t)return;b.log(e,o),f.updateCurrentValue(e,o);let r=b.getSeries(e),n=t.targetVal-o,a=(o/t.targetVal*100).toFixed(1),i=Date.now(),s=i-10080*60*1e3,l=r.filter(v=>v.loggedAt.getTime()>s),c=0,p="0 (not enough data)";if(l.length>=2){let v=l[0],K=Math.max(1,(i-v.loggedAt.getTime())/(1e3*60*60*24));c=(o-v.value)/K*7,p=`${c.toFixed(1)}/week (7-day average)`}else if(r.length>=2){let v=r[0],K=Math.max(1,(i-v.loggedAt.getTime())/(1e3*60*60*24));c=(o-v.value)/K*7,p=`${c.toFixed(1)}/week (all-time avg)`}let m=new Date(t.deadline).getTime()-i,y=Math.max(1,m/(1e3*60*60*24*7)),T=n/y,C=c,N=C>0?n/C:1/0,J=C>0?new Date(i+N*7*24*60*60*1e3).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"No projection (log more data)";console.log(`
Gap updated \u2192 ${o} ${t.unit}`),console.log(`Gap remaining: ${n} ${t.unit}`),console.log(`Closed: ${a}%`),console.log(`Velocity: ${p} (need ${Math.round(T)}/week)`),console.log(`Projected completion: ${J}`);let re={current:o,target:t.targetVal,unit:t.unit,percentClosed:Number(a),gap:n,velocity7d:c,velocity30d:c*4,targetVelocity:T,projectedWeeks:c>0?n/c:999,status:c>=T?"on-track":"behind",daysSinceMovement:r.length>1?(i-r[r.length-2].loggedAt.getTime())/864e5:0,projectedCompletionDate:J,isBehindSchedule:c<T},U=me.evaluateGap(re);if(U!=="silent")if(U==="watching"){let v=me.generateWatchingQuestion(re);console.log(ge.yellow(`
[GoatBrain] -> ${v}`)),console.log(ge.dim("(Type 'opengoat why' to answer and trigger a constraint block resolution)")),ie.create({goalId:e,triggeredBy:"stalled-48h",question:v,userResponse:"",constraintType:"clarity",unlockAction:""})}else U==="intervening"&&(console.log(ge.red(`
[CRISIS MODE] Your gap has stalled critically. The protocol must be reset.`)),console.log(ge.dim("(Run 'opengoat gap' to view full intervention options.)")))}import{render as jt,Box as ue,Text as Y}from"ink";import st from"chalk";import{jsx as se,jsxs as W}from"react/jsx-runtime";async function ct(){let o=await g.get("active_goal_id");if(!o){console.log(st.red("No active goal. Run `opengoat init` first."));return}let e=f.getById(o),t=R.getForGoal(o);if(!t||t.length===0){console.log(st.yellow("No paths generated yet for this goal. Run `opengoat init`."));return}jt(se(Kt,{paths:t,goal:e}))}var Kt=({paths:o,goal:e})=>W(ue,{flexDirection:"column",padding:1,children:[W(Y,{bold:!0,color:"cyan",children:["GOATBRAIN PATHS FOR: ",e.statement]}),se(ue,{flexDirection:"column",marginY:1,children:o.map((t,r)=>W(ue,{flexDirection:"column",marginBottom:1,borderStyle:"round",borderColor:t.isActive?"green":"gray",children:[W(Y,{bold:!0,color:t.isActive?"green":"white",children:[t.rank,". ",t.name," ",t.isActive&&se(Y,{color:"green",children:"(ACTIVE)"})]}),se(Y,{dimColor:!0,children:t.tagline}),W(ue,{flexDirection:"column",marginY:1,children:[W(Y,{children:["Gap Closes: ~",t.weeksToClose," weeks (",t.weeklyHoursRequired," hrs/wk)"]}),W(Y,{children:["Capital Req: $",t.capitalRequired]}),W(Y,{children:["Confidence: ",Math.round(t.confidenceScore),"%"]})]}),t.isActive&&W(ue,{flexDirection:"column",marginTop:1,children:[se(Y,{bold:!0,color:"yellow",children:"First Action:"}),se(Y,{children:t.firstAction.description})]})]},r))})]});import{render as qt,Box as Ne,Text as F}from"ink";import{Box as Ie,Text as fe}from"ink";var je={name:"Goat",colors:{primary:"#EF9F27",secondary:"#1D9E75",success:"#1D9E75",warning:"#E24B4A",muted:"#555550",border:"round"},barChars:{filled:"\u2588",empty:"\u2591"}};import{jsx as ke,jsxs as he}from"react/jsx-runtime";var ce=({current:o,target:e,unit:t,theme:r=je})=>{let n=Math.min(100,Math.round(o/e*100)),a=15,i=Math.round(n/100*a);return he(Ie,{flexDirection:"column",children:[he(Ie,{justifyContent:"space-between",marginBottom:0,children:[ke(fe,{color:r.colors.muted,children:t.toUpperCase()}),he(fe,{bold:!0,color:r.colors.primary,children:[n,"%"]})]}),he(Ie,{children:[ke(fe,{color:r.colors.primary,children:"\u2588".repeat(i)}),ke(fe,{color:"#252525",children:"\u2592".repeat(a-i)}),ke(Ie,{marginLeft:1,children:he(fe,{color:r.colors.muted,children:[o,"/",e]})})]})]})};import{Box as zr,Text as Zr}from"ink";import{jsx as on,jsxs as rn}from"react/jsx-runtime";import{Box as sn,Text as cn}from"ink";import{jsx as pn}from"react/jsx-runtime";import{Box as gn,Text as un}from"ink";import{jsx as hn,jsxs as yn}from"react/jsx-runtime";import{Box as En,Text as vn}from"ink";import{jsx as bn}from"react/jsx-runtime";import Jt from"chalk";import{jsx as Q,jsxs as H}from"react/jsx-runtime";async function lt(){let o=await g.get("active_goal_id");if(!o){console.log(Jt.red("No active goal. Run `opengoat init` first."));return}let e=f.getById(o),t=R.getActivePath(o),r=b.getSeries(o),n=ie.getUnresolved(o);qt(Q(zt,{goal:e,activePath:t,history:r,interventions:n}))}var zt=({goal:o,activePath:e,history:t,interventions:r})=>{let n=o.targetVal-o.currentVal,a=o.currentVal>0?Math.round(o.currentVal/o.targetVal*100):0,i=0;if(t.length>=2){let p=t[Math.max(0,t.length-7)];i=o.currentVal-p.value}let s=new Date(o.deadline).getTime()-Date.now(),l=Math.max(1,s/(1e3*60*60*24*7)),c=n/l;return H(Ne,{flexDirection:"column",padding:1,borderStyle:"round",borderColor:"#EF9F27",children:[Q(F,{bold:!0,color:"#EF9F27",children:"GAP STATUS"}),Q(Ne,{marginY:1,children:Q(ce,{current:o.currentVal,target:o.targetVal,unit:o.unit})}),H(F,{dimColor:!0,children:["Goal: ",o.statement]}),e&&H(F,{dimColor:!0,children:["Path: ",e.name]}),H(Ne,{flexDirection:"column",marginTop:1,children:[H(F,{children:["Velocity: ",H(F,{color:i>=c?"green":"yellow",children:["+",i.toFixed(1),"/wk"]})," (Target: ",Math.round(c),"/wk)"]}),H(F,{children:["Pace: ",i>=c?"On Track":"Behind Pace"]}),H(F,{children:["Remaining: ",n.toFixed(1)," ",o.unit]})]}),r.length>0&&H(Ne,{flexDirection:"column",marginTop:1,padding:1,borderStyle:"round",borderColor:"red",children:[Q(F,{bold:!0,color:"red",children:"\u{1F6A8} ACTIVE INTERVENTION"}),Q(F,{children:r[0].question}),Q(F,{dimColor:!0,children:"Run `opengoat why` to resolve this block."})]})]})};import Zt from"inquirer";import B from"chalk";async function pt(){let o=await g.get("active_goal_id");if(!o){console.log(B.red("No active goal. Run `opengoat init` first."));return}let e=f.getById(o),t=z.getByGoalId(o);console.log(B.cyan(`
UPDATING RESOURCES FOR: ${e?.statement}`)),t&&(console.log(B.dim("Your last answers were processed into this mapped profile:")),console.log(B.dim(JSON.stringify(t,null,2)))),console.log(B.yellow(`
Provide new answers for the 5 dimensions. Leave blank to skip that dimension.`));let r=await Zt.prompt([{name:"time",message:"[Time] Any changes to schedule/availability?"},{name:"capital",message:"[Capital] Did funding, income, or runway change?"},{name:"skills",message:"[Skills] Any new skills acquired or tools mastered?"},{name:"network",message:"[Network] Any new valuable connections or platforms?"},{name:"assets",message:"[Assets] Any new leverage or reputation built?"}]);if(!r.time&&!r.capital&&!r.skills&&!r.network&&!r.assets){console.log(B.dim("No changes made. Aborting."));return}console.log(B.blue("GoatBrain is analyzing new dimensions..."));try{let n=await g.get("preferred_provider")||"Ollama (Local)",a=await M(n),i=Z.generateProfileExtractionPrompt(r),s=await L(a,i),l=JSON.parse(s.replace(/```json|```/g,"").trim());z.save(o,l),console.log(B.blue("Re-calculating paths based on new profile..."));let c=ne.generatePrompt(e,l),p=await L(a,c),m=JSON.parse(p.replace(/```json|```/g,"").trim());R.savePaths(o,m),console.log(B.green("Resources updated and Top 5 Paths fully regenerated.")),console.log(B.dim("Run `opengoat paths` to lock in your new strategy."))}catch(n){console.log(B.red(`GoatBrain failed: ${n.message}`))}}import{v4 as Qt}from"uuid";var k=class{static saveWeekScore(e){let t=h(),r=Qt();return t.prepare(`
      INSERT INTO week_scores (
        id, goal_id, week_number, velocity_score, consistency, 
        momentum, path_fit, total, rank, xp, gap_at_week
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(goal_id, week_number) DO UPDATE SET
        velocity_score=excluded.velocity_score, consistency=excluded.consistency, 
        momentum=excluded.momentum, path_fit=excluded.path_fit, total=excluded.total, 
        rank=excluded.rank, xp=excluded.xp, gap_at_week=excluded.gap_at_week, 
        scored_at=datetime("now")
    `).run(r,e.goalId,e.weekNumber,e.velocityScore,e.consistency,e.momentum,e.pathFit,e.total,e.rank,e.xp,e.gapAtWeek),r}static getScores(e,t=12){return h().prepare("SELECT * FROM week_scores WHERE goal_id = ? ORDER BY week_number DESC LIMIT ?").all(e,t).map(a=>({id:a.id,goalId:a.goal_id,weekNumber:a.week_number,velocityScore:a.velocity_score,consistency:a.consistency,momentum:a.momentum,pathFit:a.path_fit,total:a.total,rank:a.rank,xp:a.xp,gapAtWeek:a.gap_at_week,scoredAt:new Date(a.scored_at+"Z")}))}};import $ from"chalk";async function dt(){let o=await g.get("active_goal_id");if(!o){console.log($.red("No active goal. Run `opengoat init` first."));return}let e=f.getById(o),t=R.getActivePath(o),r=b.getSeries(o);if(!e||!t)return;console.log($.cyan(`
SCORING WEEK ENDING: ${new Date().toISOString().split("T")[0]}`));let n=0;if(r.length>=2){let N=r[Math.max(0,r.length-7)];n=e.currentVal-N.value}let a=Math.max(1,(new Date(e.deadline).getTime()-Date.now())/(1e3*60*60*24*7)),i=(e.targetVal-e.currentVal)/a,s=Math.min(100,Math.max(0,n/i*100)),l=r.length>5?85:40,c=n>0?90:20,p=95,m=s*.4+l*.3+c*.2+p*.1,y=Math.round(m*10),T="GHOST";m>90?T="APEX":m>70?T="OPERATOR":m>40&&(T="RECRUIT");let C={goalId:o,weekNumber:k.getScores(o).length+1,velocityScore:s,consistency:l,momentum:c,pathFit:p,total:m,rank:T,xp:y,gapAtWeek:e.targetVal-e.currentVal};k.saveWeekScore(C),console.log($.hex("#EF9F27")(`
Velocity Score  : ${Math.round(s)} / 100`)),console.log($.hex("#EF9F27")(`Consistency     : ${l} / 100`)),console.log($.hex("#EF9F27")(`Momentum        : ${c} / 100`)),console.log($.hex("#EF9F27")(`Path Fit        : ${p} / 100`)),console.log($.green(`
TOTAL SCORE     : ${Math.round(m)}`)),console.log($.green(`RANK EARNED     : ${T}`)),console.log($.green(`XP GAINED       : +${y} XP`)),console.log($.dim(`
Run 'opengoat share' to generate your viral scorecard.
`))}import _e from"chalk";import eo from"fs";import to from"path";import oo from"os";async function mt(){let o=await g.get("active_goal_id");if(!o){console.log(_e.red("\nNo active goal. Run `opengoat init` first.\n"));return}let e=f.getById(o),t=k.getScores(o,1),r=b.getSeries(o),n=t[0],a=n?.rank||"RECRUIT",i=n?.xp||0,s=n?.total||0,l=e?Math.round(e.currentVal/e.targetVal*100):0,c=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>OpenGOAT Scorecard</title>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;900&family=Orbitron:wght@700;900&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #080808;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    font-family: 'JetBrains Mono', monospace;
  }
  .card {
    width: 680px;
    background: #0e0e0e;
    border: 1px solid #252525;
    border-radius: 12px;
    padding: 40px;
    position: relative;
    overflow: hidden;
  }
  .card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, #EF9F27, #1D9E75);
  }
  .goat { font-size: 48px; margin-bottom: 8px; }
  .brand { font-family: 'Orbitron', monospace; color: #EF9F27; font-size: 24px; font-weight: 900; letter-spacing: 4px; }
  .tagline { color: #555550; font-size: 12px; margin-top: 4px; letter-spacing: 2px; }
  .divider { border: none; border-top: 1px solid #1e1e1e; margin: 24px 0; }
  .goal-label { color: #555550; font-size: 11px; letter-spacing: 2px; margin-bottom: 8px; }
  .goal-text { color: #e8e6df; font-size: 16px; font-weight: 700; line-height: 1.4; }
  .metrics { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 24px 0; }
  .metric { text-align: center; }
  .metric-value { font-family: 'Orbitron', monospace; font-size: 28px; font-weight: 900; color: #EF9F27; }
  .metric-label { color: #555550; font-size: 10px; letter-spacing: 2px; margin-top: 4px; }
  .progress-bar { background: #141414; border-radius: 4px; height: 8px; overflow: hidden; margin: 16px 0 4px; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #EF9F27, #1D9E75); border-radius: 4px; transition: width 0.3s; }
  .progress-label { display: flex; justify-content: space-between; color: #555550; font-size: 11px; }
  .rank-badge { display: inline-block; background: #1D9E7522; border: 1px solid #1D9E75; color: #1D9E75; font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; padding: 4px 16px; border-radius: 4px; letter-spacing: 3px; margin-top: 16px; }
  .footer { color: #2a2a28; font-size: 10px; text-align: center; margin-top: 24px; letter-spacing: 2px; }
</style>
</head>
<body>
<div class="card">
  <div class="goat">\u{1F410}</div>
  <div class="brand">OPENGOAT</div>
  <div class="tagline">GOAL OPERATING SYSTEM \xB7 GAP = GOAL \u2212 CURRENT</div>
  <hr class="divider">
  <div class="goal-label">ACTIVE MISSION</div>
  <div class="goal-text">${e?.statement||"No active goal"}</div>
  <div class="metrics">
    <div class="metric">
      <div class="metric-value">${l}%</div>
      <div class="metric-label">GAP CLOSED</div>
    </div>
    <div class="metric">
      <div class="metric-value">${s}</div>
      <div class="metric-label">OPERATOR SCORE</div>
    </div>
    <div class="metric">
      <div class="metric-value">${r.length}</div>
      <div class="metric-label">DATA POINTS</div>
    </div>
  </div>
  <div class="progress-bar">
    <div class="progress-fill" style="width:${Math.min(100,l)}%"></div>
  </div>
  <div class="progress-label">
    <span>${e?.currentVal||0} ${e?.unit||""}</span>
    <span>${e?.targetVal||0} ${e?.unit||""}</span>
  </div>
  <div class="rank-badge">${a}</div>
  <div class="footer">opengoat.dev \xB7 built by a goat, for goats</div>
</div>
</body>
</html>`,p=to.join(oo.tmpdir(),`opengoat-share-${Date.now()}.html`);eo.writeFileSync(p,c,"utf-8"),console.log(_e.green(`
\u2713 Scorecard generated: ${p}`));try{let{default:m}=await import("open");await m(p),console.log(_e.dim(`  Opened in browser. Screenshot and post to X! \u{1F680}
`))}catch{console.log(_e.dim(`  Open this file in your browser: ${p}
`))}}import Ce from"chalk";async function gt(){let o=await g.get("active_goal_id");if(!o){console.log(Ce.red("No active goal."));return}let e=f.getById(o),t=b.getSeries(o),r=await g.get("preferred_provider")||"Ollama (Local)";console.log(Ce.cyan(`Booting ${r} for deep diagnostic analysis...`));try{let n=await M(r),a=`
You are GoatBrain Diagnostics.
Analyze the following gap velocity time-series and Goal constraints.
Goal: ${JSON.stringify(e,null,2)}
Gap Log: ${JSON.stringify(t,null,2)}

Identify any latent friction patterns or acceleration windows in this exact time-series.
Output a 3-bullet insight summary. Be brutally honest. No intro.
`,i=await L(n,a);console.log(`
${Ce.yellow(i)}`)}catch(n){console.log(Ce.red(`Diagnostic failed: ${n.message}`))}}import{render as ro,Box as De,Text as G}from"ink";import no from"chalk";import{jsx as q,jsxs as j}from"react/jsx-runtime";async function ut(){let o=await g.get("active_goal_id");if(!o){console.log(no.red("No active goal. Run `opengoat init` first."));return}let e=f.getById(o);if(!e)return;let t=R.getActivePath(o),r=b.getSeries(o),n=k.getScores(o,4);ro(q(ao,{goal:e,path:t,scores:n,history:r}))}var ao=({goal:o,path:e,scores:t,history:r})=>{let n=Math.round(o.currentVal/o.targetVal*100),a=o.targetVal-o.currentVal,i=t.length>0?t[0].rank:"UNRANKED",s=t.reduce((l,c)=>l+c.xp,0);return j(De,{flexDirection:"column",padding:1,borderStyle:"round",borderColor:"#EF9F27",children:[q(G,{bold:!0,color:"#EF9F27",children:"OPENGOAT COCKPIT"}),q(De,{marginY:1,children:q(ce,{current:o.currentVal,target:o.targetVal,unit:o.unit})}),j(G,{dimColor:!0,children:["Goal: ",o.statement]}),j(G,{dimColor:!0,children:["Deadline: ",o.deadline," (",n,"% Closed)"]}),j(G,{dimColor:!0,children:["Remaining: ",a," ",o.unit]}),j(De,{flexDirection:"column",marginTop:1,padding:1,borderStyle:"round",borderColor:"yellow",children:[q(G,{bold:!0,color:"yellow",children:"ACTIVE STRATEGY"}),q(G,{children:e?e.name:"None Selected (Run `opengoat paths`)"}),e&&q(G,{dimColor:!0,children:e.tagline})]}),j(De,{flexDirection:"column",marginTop:1,padding:1,borderStyle:"round",borderColor:"green",children:[q(G,{bold:!0,color:"green",children:"OPERATOR STATS"}),j(G,{children:["Current Rank: ",i]}),j(G,{children:["Total XP: ",s]}),j(G,{children:["Logs: ",r.length," entries"]})]})]})};import Ke from"chalk";import io from"path";import so from"cors";async function ft(o){let e=(await import("express")).default,t=e(),r=Number(o)||3e3;t.use(e.json()),t.use(so());let n=io.join(process.cwd(),"web");t.use(e.static(n)),t.get("/api/state",async(a,i)=>{let s=await g.get("active_goal_id");if(!s)return i.status(404).json({error:"No active goal"});let l=f.getById(s),c=R.getActivePath(s),p=b.getSeries(s),m=k.getScores(s,1);i.json({goal:l?.statement,gap:{current:l?.currentVal,target:l?.targetVal,unit:l?.unit},score:{total:m.length>0?m[0].total:0,rank:m.length>0?m[0].rank:"RECRUIT",xp:m.length>0?m[0].xp:0},path:c?.name,historyCount:p.length})}),t.get("/api/state/stream",async(a,i)=>{i.setHeader("Content-Type","text/event-stream"),i.setHeader("Cache-Control","no-cache"),i.setHeader("Connection","keep-alive"),i.flushHeaders();let s=async()=>{let c=await g.get("active_goal_id");if(!c)return{error:"No active goal"};let p=f.getById(c),m=R.getActivePath(c),y=b.getSeries(c),T=k.getScores(c,1);return{goal:p?.statement,gap:{current:p?.currentVal,target:p?.targetVal,unit:p?.unit},score:{total:T[0]?.total||0,rank:T[0]?.rank||"RECRUIT",xp:T[0]?.xp||0},path:m?.name,historyCount:y.length,ts:Date.now()}};i.write(`data: ${JSON.stringify(await s())}

`);let l=setInterval(async()=>{try{i.write(`data: ${JSON.stringify(await s())}

`)}catch{clearInterval(l)}},2e3);a.on("close",()=>clearInterval(l))}),t.get("/api/v1/goal",async(a,i)=>{let s=await g.get("active_goal_id");if(!s)return i.status(404).json({error:"No active goal"});let l=f.getById(s);i.json(l)}),t.get("/api/v1/paths/active",async(a,i)=>{let s=await g.get("active_goal_id");if(!s)return i.status(404).json({error:"No active goal"});let l=R.getActivePath(s);i.json(l)}),t.get("/api/v1/gap/history",async(a,i)=>{let s=await g.get("active_goal_id");if(!s)return i.status(404).json({error:"No active goal"});let l=b.getSeries(s);i.json(l)}),t.post("/api/v1/gap/log",async(a,i)=>{let s=await g.get("active_goal_id");if(!s)return i.status(404).json({error:"No active goal"});let{value:l,note:c}=a.body,p=b.log(s,Number(l),c);f.updateCurrentValue(s,Number(l)),i.json(p)}),t.listen(r,async()=>{let a=`http://localhost:${r}`;console.log(Ke.green(`
\u{1F680} OpenGOAT API running on ${a}`)),console.log(Ke.hex("#1D9E75")(`   SSE live stream: ${a}/api/state/stream`)),console.log(Ke.dim(`   Hook in your Obsidian/Notion/iOS plugins to read the local gap state.
`));let{default:i}=await import("open").catch(()=>({default:null}));i&&i(a)})}import ht from"chalk";async function yt(){console.log(ht.red.bold("NUCLEAR PURGE INITIATED"));let o=h();o.transaction(()=>{o.prepare("DELETE FROM gap_log").run(),o.prepare("DELETE FROM interventions").run(),o.prepare("DELETE FROM week_scores").run(),o.prepare("DELETE FROM paths").run(),o.prepare("DELETE FROM resource_profiles").run(),o.prepare("DELETE FROM goals").run()})(),await g.set("active_goal_id",null),console.log(ht.green("All local GoatOS data deleted."))}import{useState as ye,useEffect as xt,memo as qe}from"react";import{render as co,Box as x,Text as u,useInput as lo,useApp as po,useStdout as mo}from"ink";import{jsx as d,jsxs as E}from"react/jsx-runtime";var ee="#EF9F27",te="#1D9E75",Le="#E24B4A",P="#555550",le="#333333";var go=qe(({goal:o,gap:e,closedPct:t,rank:r})=>E(x,{borderStyle:"round",borderColor:le,paddingX:1,justifyContent:"space-between",height:3,flexShrink:0,children:[E(x,{children:[d(u,{color:ee,bold:!0,children:"GOAT_OS // "}),d(u,{color:P,children:"MISSION: "}),d(u,{color:"white",wrap:"truncate-end",children:o||"UNASSIGNED"})]}),E(x,{children:[d(u,{color:P,children:"GAP: "}),d(u,{color:ee,children:e||"--"}),d(u,{color:P,children:" \u2502 "}),d(u,{color:P,children:"CLOSED: "}),E(u,{color:te,children:[t,"%"]}),d(u,{color:P,children:" \u2502 "}),E(u,{color:te,bold:!0,children:["[",r?.toUpperCase()||"RECRUIT","]"]})]})]})),uo=qe(({current:o,target:e,unit:t,compact:r=!1,height:n})=>E(x,{flexDirection:"column",width:32,height:n,paddingX:1,borderStyle:"round",borderColor:le,flexShrink:0,overflow:"hidden",children:[d(u,{color:P,bold:!0,children:"TELEMETRY"}),d(x,{marginY:1,children:d(ce,{current:o,target:e,unit:t})}),E(x,{flexDirection:"column",marginTop:1,children:[d(u,{color:P,children:"VELOCITY"}),d(u,{color:te,bold:!0,children:"+14.2/wk"}),E(x,{marginTop:1,flexDirection:"column",children:[d(u,{color:P,children:"PROJECTION"}),d(u,{color:"white",children:"Wk 14 (Nov 26)"})]})]}),E(x,{flexGrow:1,justifyContent:"flex-end",flexDirection:"column",children:[d(u,{color:P,children:"SYSTEM STATUS"}),d(u,{color:te,children:"\u25CF NOMINAL"})]})]})),fo=qe(({score:o,xp:e,compact:t=!1,height:r})=>E(x,{flexDirection:"column",width:32,height:r,paddingX:1,borderStyle:"round",borderColor:le,flexShrink:0,overflow:"hidden",children:[d(u,{color:P,bold:!0,children:"OPERATOR"}),E(x,{marginY:1,flexDirection:"column",children:[d(u,{color:P,children:"SCORE"}),d(u,{color:ee,bold:!0,children:o})]}),E(x,{flexDirection:"column",marginTop:1,children:[d(u,{color:P,children:"MOMENTUM"}),d(u,{color:ee,children:"\u2588\u2588\u2588\u2588\u2588\u2588\u2591\u2591"}),E(x,{marginTop:1,flexDirection:"column",children:[d(u,{color:P,children:"SYNC RATE"}),d(u,{color:te,children:"\u2588\u2588\u2588\u2588\u2588\u2588\u2588\u2588"})]})]}),d(x,{flexGrow:1,justifyContent:"flex-end",children:d(x,{borderStyle:"single",borderColor:"#4a1515",width:"100%",justifyContent:"center",children:d(u,{color:Le,bold:!0,children:" \u26A1 OVERRIDE"})})})]})),ho=()=>d(u,{color:ee,children:"\u2588"}),yo=({onSubmit:o,onExit:e,width:t})=>{let[r,n]=ye("");return lo((a,i)=>{i.return?(r.trim()&&o(r),n("")):i.backspace||i.delete?n(s=>s.slice(0,-1)):i.escape?e():a&&!i.ctrl&&!i.meta&&n(s=>s+a)}),E(x,{borderStyle:"round",borderColor:le,paddingX:1,flexShrink:0,height:3,children:[d(u,{color:ee,bold:!0,children:"# "}),d(u,{color:"white",wrap:"truncate-end",children:r.slice(0,t)}),d(ho,{})]})},xo=()=>{let{exit:o}=po(),{stdout:e}=mo(),[t,r]=ye({rows:e.rows,columns:e.columns});xt(()=>{let w=()=>r({rows:e.rows,columns:e.columns});return e.on("resize",w),()=>{e.off("resize",w)}},[e]);let[n,a]=ye([{type:"system",text:"boot sequence initiated..."},{type:"system",text:"goatbrain v2.6 loaded (anti-flicker mode)."},{type:"info",text:"awaiting operator input."}]),[i,s]=ye({goal:null,gap:{current:0,target:100,unit:""},score:{total:0,rank:"Recruit"}}),[l,c]=ye(!1);xt(()=>{(async()=>{try{let S=await g.get("active_goal_id");if(S){let D=f.getById(S),pe=k.getScores(S,1),Ot=pe.reduce((It,kt)=>It+kt.xp,0);s({goal:D?.statement,gap:{current:D?.currentVal||0,target:D?.targetVal||100,unit:D?.unit||""},score:{total:Ot,rank:pe[0]?.rank||"Recruit"}})}}catch{}})()},[]);let p=(w,S)=>{a(D=>[...D.slice(-30),{type:w,text:S}])},m=async w=>{let S=w.trim();if(S)if(p("cmd",`> ${S}`),S.startsWith("/")){let[D,...pe]=S.slice(1).split(" ");switch(D.toLowerCase()){case"q":case"quit":case"exit":o();break;case"help":p("info","COMMANDS: /clear, /refresh, /quit");break;case"clear":a([]);break;default:p("warn",`Unknown command: /${D}`)}}else c(!0),await y(S),c(!1)},y=async w=>{try{let S=await M(await g.get("ai_provider")||"groq"),D=`You are GoatBrain OS. You live in a terminal. Keep answers extremely short, 1-2 sentences. Goal context: ${i.goal}`,pe=await L(S,`${D}

User: ${w}`);p("ai",pe)}catch(S){p("warn",`NETWORK ERROR: ${S.message}`)}},T=Math.round(i.gap.current/i.gap.target*100),C=t.rows<25,N=3,J=3,re=3,U=4,v=Math.max(5,t.rows-re-J-U),K=Math.max(30,t.columns-64-2),ve=Math.max(1,v-3-(l?1:0)-2),Pt=n.slice(-ve);return t.rows<15||t.columns<80?d(x,{padding:1,borderStyle:"round",borderColor:Le,children:E(u,{color:Le,bold:!0,children:["WINDOW TOO SMALL. PLEASE RESIZE. (",t.columns,"x",t.rows,")"]})}):E(x,{flexDirection:"column",height:t.rows-U,overflow:"hidden",children:[d(go,{goal:i.goal,gap:i.gap.target-i.gap.current,closedPct:T,rank:i.score.rank}),E(x,{height:v,overflow:"hidden",children:[d(uo,{current:i.gap.current,target:i.gap.target,unit:i.gap.unit,compact:C,height:v}),E(x,{flexDirection:"column",flexGrow:1,height:v,borderStyle:"round",borderColor:le,paddingX:1,overflow:"hidden",children:[E(x,{flexGrow:1,flexDirection:"column",overflowY:"hidden",children:[Pt.map((w,S)=>E(x,{paddingLeft:w.type==="ai"?0:2,height:1,overflow:"hidden",children:[d(u,{color:w.type==="cmd"?ee:w.type==="ai"?te:w.type==="warn"?Le:P,children:w.type==="cmd"?"":w.type==="ai"?"\u25C6  ":""}),d(u,{color:(w.type==="cmd","white"),dimColor:w.type==="system",bold:w.type==="cmd",wrap:"truncate-end",children:w.text.slice(0,K-8)})]},S)),l&&d(x,{paddingLeft:2,height:1,children:d(u,{color:te,italic:!0,children:"goatbrain is thinking..."})})]}),d(yo,{onSubmit:m,onExit:o,width:K-10})]}),d(fo,{score:i.score.total,xp:i.score.total,compact:C,height:v})]}),E(x,{borderStyle:"round",borderColor:le,paddingX:1,justifyContent:"space-between",height:J,flexShrink:0,children:[d(x,{children:d(u,{color:P,children:"GOAT_OS v3.0 [PREMIUM]"})}),d(x,{children:E(u,{color:P,children:["[T: ",t.columns,"x",t.rows," | M: ",process.memoryUsage().rss/1024/1024|0,"MB]"]})})]})]})};async function Tt(){process.stdout.write("\x1B[?1049h"),process.stdout.write("\x1B[?25l");let{waitUntilExit:o}=co(d(xo,{}));try{await o()}finally{process.stdout.write("\x1B[?1049l"),process.stdout.write("\x1B[?25h"),process.exit(0)}}import A from"chalk";import{v4 as To}from"uuid";var oe=class{static getByGoal(e,t){return h().prepare("SELECT * FROM missions WHERE goal_id = ? AND week = ?").all(e,t).map(a=>({id:a.id,title:a.title,description:a.description,estimatedHours:a.estimated_hours,status:a.status,week:a.week,pathId:a.path_id,goalId:a.goal_id,xp:a.xp,difficulty:a.difficulty,createdAt:new Date(a.created_at)}))}static create(e){let t=h(),r=To();return t.prepare(`
      INSERT INTO missions (id, title, description, estimated_hours, status, week, path_id, goal_id, xp, difficulty)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(r,e.title,e.description,e.estimatedHours,e.status,e.week,e.pathId,e.goalId,e.xp,e.difficulty),r}static getAllByGoal(e){return h().prepare("SELECT * FROM missions WHERE goal_id = ? ORDER BY week DESC").all(e).map(n=>({id:n.id,title:n.title,description:n.description,estimatedHours:n.estimated_hours,status:n.status,week:n.week,pathId:n.path_id,goalId:n.goal_id,xp:n.xp,difficulty:n.difficulty,createdAt:new Date(n.created_at)}))}static markComplete(e){h().prepare("UPDATE missions SET status = 'complete' WHERE id = ?").run(e)}};function Eo(o){return o==="complete"?A.green("[\u2713]"):o==="pending"?A.yellow("[\u2192]"):A.dim("[ ]")}async function Et(o,e){let t=await g.get("active_goal_id");if(!t){console.log(A.red("\n No active goal. Run `opengoat init` first.\n"));return}let r=f.getById(t);if(o==="complete"&&e){oe.markComplete(e),console.log(A.green(`
\u2713 Mission ${e} complete!`));return}let n=oe.getAllByGoal(t);if(n.length===0){console.log(A.dim(`
 No generated missions found for this goal. Select a generated Path first!
`));return}let a=n.filter(p=>p.status==="complete").length,i=n.filter(p=>p.status==="complete").reduce((p,m)=>p+m.xp,0),s=n.reduce((p,m)=>p+m.xp,0);console.log(`
`+A.hex("#EF9F27").bold(`  \u25E2 MISSION BOARD \u2014 ${r?.statement||"Your Goal"}`)),console.log(A.dim(`  Progress: ${a}/${n.length} missions \xB7 ${i} XP earned
`));for(let p of n){let m=Eo(p.status),y=p.status==="complete"?A.dim:A.white.bold,T=p.status==="complete"?A.green:A.dim;console.log(`  ${m} ${y(p.title.padEnd(30))} ${T(`+${p.xp} XP`)}  ${A.dim(`(ID: ${p.id.slice(0,8)})`)}`),p.status!=="complete"&&console.log(A.dim(`      ${p.description}`))}let l=Math.round(a/Math.max(1,n.length)*100),c="\u2588".repeat(Math.round(l/5))+"\u2591".repeat(20-Math.round(l/5));console.log(`
`+A.dim(`  [${c}] ${l}% Mission Complete`)),console.log(A.hex("#1D9E75")(`  Total XP Pool: ${s} XP available
`)),a<n.length&&console.log(A.dim("  To complete a mission: opengoat missions complete <ID>"))}import{render as vo,Box as Be,Text as Ge}from"ink";function vt(o,e){let t=o.length,r=o.filter(y=>y.status==="complete").length,n=o.filter(y=>y.status==="missed").length,a=t>0?Math.round(r/t*100):0,i=Math.max(0,100-n*15),s=Math.min(100,a*1.1),l=10,c=t===0?0:Math.round(a*.4+i*.3+s*.2+l*.1),p=r*100+Math.floor(c/10)*50,m=c>=90?"Apex":c>=70?"Ghost":c>=40?"Operator":"Recruit";return{execution:a,consistency:i,capitalVelocity:s,reflection:l,total:c,rank:m,xp:p,weekNumber:e}}import{jsx as Je,jsxs as xe}from"react/jsx-runtime";async function wt(){let o=f.getAllActive();if(o.length!==0)for(let e of o){let t=oe.getByGoal(e.id,1),r=vt(t,1),n=t.length,a=t.filter(s=>s.status==="complete").length,i=t.filter(s=>s.status==="missed").length;vo(xe(Be,{flexDirection:"column",borderStyle:"double",borderColor:"yellow",padding:1,marginY:1,children:[xe(Ge,{bold:!0,inverse:!0,color:"yellow",children:[" WEEKLY RECAP: ",e.statement.toUpperCase()," "]}),Je(Be,{marginTop:1,children:xe(Ge,{color:"green",children:["SUCCESS: ",a," missions crushed"]})}),Je(Be,{children:xe(Ge,{color:"red",children:["MISSED: ",i," protocols drifted"]})}),Je(Be,{marginTop:1,children:xe(Ge,{bold:!0,children:["FINAL SCORE: ",r.total," (",r.rank,")"]})})]}))}}import{Command as wo}from"commander";import O from"chalk";import bo from"os";import bt from"path";import Te from"fs";import Ro from"better-sqlite3";var Rt=new wo("doctor").description("Run diagnostic health checks on the OpenGOAT system").action(async()=>{console.log(O.bold.cyan(`
\u{1FA7A} OpenGOAT System Doctor`)),console.log(O.dim("========================================="));let o=0,e=0,t=(a,i,s)=>{let l=i==="OK"?O.green("\u2713"):i==="WARN"?O.yellow("\u26A0"):O.red("\u2717"),c=i==="OK"?O.green:i==="WARN"?O.yellow:O.red;console.log(`${l} ${O.bold(a)}: ${c(i)}`),s&&console.log(`   ${O.dim(s)}`),i==="WARN"&&e++,i==="FAIL"&&o++},r=bt.join(bo.homedir(),".opengoat");try{if(!Te.existsSync(r))t("Home Directory","WARN","~/.opengoat does not exist. It will be created automatically.");else{let a=Te.statSync(r);Te.accessSync(r,Te.constants.W_OK),t("Home Directory","OK","~/.opengoat is accessible.")}}catch(a){t("Home Directory","FAIL",`Cannot access ~/.opengoat: ${a.message}`)}try{let a=bt.join(r,"goals.db");if(Te.existsSync(a)){let i=new Ro(a,{fileMustExist:!0}),s=i.prepare("SELECT COUNT(*) as count FROM goals").get();t("Database","OK",`Connected to goals.db. Found ${s.count} goals.`),i.close()}else t("Database","WARN","goals.db does not exist yet. Run 'opengoat init'.")}catch(a){t("Database","FAIL",`Database connection failed: ${a.message}`)}let n=[];try{let a=V.get("opengoat","groq"),i=V.get("opengoat","anthropic"),s=V.get("opengoat","openai"),l=V.get("opengoat","ollama"),c=[a?"groq":null,i?"anthropic":null,s?"openai":null,l?"ollama":null].filter(Boolean);n=c,c.length>0?t("Secret Store","OK",`Found configurations for: ${c.join(", ")}`):t("Secret Store","WARN","No API keys configured. Run 'opengoat init' to set up an AI provider.")}catch(a){t("Secret Store","FAIL",`Failed to access SecretStore: ${a.message}`)}console.log(O.dim(`
Probing AI Provider connectivity...`));try{if(n.length>0){let a=n[0],i=await M(a),s=Date.now(),l=await i.complete('Reply exactly with the word "pong". Output no other text.'),c=Date.now()-s;l&&l.toLowerCase().includes("pong")?t(`AI Connection (${a})`,"OK",`Provider responded in ${c}ms. (${l.trim()})`):t(`AI Connection (${a})`,"WARN",`Provider responded but output was unexpected: ${l}`)}else t("AI Connection","WARN","Skipped probe. No AI provider configured.")}catch(a){t("AI Connection","FAIL",`AI connectivity test failed: ${a.message}`)}console.log(O.dim(`
=========================================`)),console.log(o===0&&e===0?O.bold.green("All systems nominal. OpenGOAT is ready."):O.bold(`Diagnosis complete with ${O.red(o+" errors")} and ${O.yellow(e+" warnings")}.`)),process.exit(o>0?1:0)});import So from"os";import Fe from"path";import Ee from"fs/promises";var ze=class{playbooks=new Map;providers=new Map;renderers=new Map;storage=null;registerPlaybook(e){this.playbooks.set(e.name,e)}registerProvider(e){this.providers.set(e.name,e)}registerRenderer(e){this.renderers.set(e.name,e)}setStorage(e){this.storage=e}getPlaybooks(){return Array.from(this.playbooks.values())}getProviders(){return Array.from(this.providers.values())}getProvider(e){return this.providers.get(e)}getStorage(){return this.storage}},Ze=new ze;import St from"chalk";var Me=Fe.join(So.homedir(),".opengoat","skills");async function At(){try{try{await Ee.access(Me)}catch{await Ee.mkdir(Me,{recursive:!0});return}let o=await Ee.readdir(Me,{withFileTypes:!0});for(let e of o)if(e.isDirectory()){let t=Fe.join(Me,e.name),r=Fe.join(t,"index.js"),n=Fe.join(t,"index.mjs"),a=null;try{await Ee.access(r),a=r}catch{}if(!a)try{await Ee.access(n),a=n}catch{}if(a)try{let s=await import(new URL(`file://${a}`).href);if(s.default&&typeof s.default=="function"){let l=s.default();l.name&&l.category&&Ze.registerPlaybook(l)}else s.plugin&&Ze.registerPlaybook(s.plugin)}catch(i){console.error(St.yellow(`[SkillsLoader] Failed to load skill '${e.name}': ${i.message}`))}}}catch(o){console.error(St.red(`[SkillsLoader] Critical failure reading ~/.opengoat/skills: ${o.message}`))}}var I=new Ao;I.name("opengoat").description("The GOAT Operating System for Goals v1").version("1.1.8").action(()=>{process.argv.length<=2&&Tt()});I.command("init").description("Setup wizard and 5D resource mapping").action(at);I.command("log <number>").description("Log your current number towards the gap").action(o=>it(Number(o)));I.command("paths").description("View and select GoatBrain generated paths").action(ct);I.command("gap").description("View current gap velocity and interventions").action(lt);I.command("resources").description("Update your 5D resources and re-calculate paths").action(pt);I.command("score").description("Calculate weekly OS operator score").action(dt);I.command("share").description("Generate shareable HTML scorecard").action(mt);I.command("analyze").description("Cross-goal correlation logic").action(gt);I.command("dashboard").description("Live terminal cockpit UI").action(ut);I.command("serve").description("Start Plugin API layer").action(ft);I.command("reset").description("Nuclear data purge").action(yt);I.command("missions [action] [id]").description("View protocol missions and XP progress").action(Et);I.command("recap").description("Weekly performance recap and insights").action(wt);I.addCommand(Rt);(async()=>(await At(),I.parse(process.argv)))();
//# sourceMappingURL=index.js.map