const REPLIES=[
 [/xp|level|badge|reward|banyan|streak/i,"Employees grow a Banyan through six levels — Seed to Legend — earning XP from every completed challenge, plus badges like Hydration Hero, Sleep Master and Green Eater. Streaks keep the momentum daily."],
 [/leaderboard|compete|rank/i,"A weekly leaderboard ranks colleagues on wellness improvement percentage — friendly competition across departments, with only opted-in, improvement-based scores shown."],
 [/mood|feel|check.?in/i,"A one-tap daily mood check lets employees log how they feel. Trends aggregate at team level, giving HR an early emotional-health signal without exposing anyone."],
 [/wellness index|index|score/i,"Every employee gets a personal Wellness Index out of 100, built from habits, challenges and check-ins — and teams get an aggregated index that leadership can track quarter over quarter."],
 [/yoga|asana|stretch/i,"We run live corporate yoga sessions and guided asana routines — from 5-minute desk stretches to full practice classes, matched to team schedules and constitution."],
 [/diet|nutrition|food|meal|symptom/i,"Two layers of nutrition: Dosha Diet Plans matched to Vata–Pitta–Kapha constitution, plus symptom-based guidance that adapts to what employees report — acidity, fatigue, digestion issues and more."],
 [/sleep|water|hydrat|habit/i,"Daily-habit tracks cover hydration (water-intake tracking with nudges) and Sleep Rhythm — wind-down routines aligned to each dosha's natural clock. Small habits, compounding KPIs."],
 [/medical|condition|preventive|prevent|care|health issue|back pain|stress/i,"Condition Care offers expert wellness guidance for common issues — stress, back pain, lifestyle disorders — with escalation to professionals. Preventive Care adds early-signal screenings that catch tomorrow's absence today."],
 [/exercise|workout|fitness|movement|steps/i,"Exercise & Movement covers step streaks, strength routines and team movement challenges — scaled to every fitness level and gamified with points and leaderboards."],
 [/tridosha|dosha|prakriti|vata|pitta|kapha/i,"Employees complete a Tridosha (Vata–Pitta–Kapha) assessment. Results aggregate at team level for program design — individual profiles are never visible to any company role."],
 [/privacy|data|anonym|secure|gdpr|personal|rls/i,"HR and leadership only ever see team averages, trends and department analysis — never an individual. If a team is too small to stay anonymous, its numbers don't display at all, and every platform-level access is permanently logged."],
 [/price|pricing|cost|plan/i,"Pricing scales with headcount and modules. Email hello@ayumonk.com for a proposal — we typically turn these around within one business day."],
 [/demo|contact|trial|sales|talk/i,"Use 'Book a demo' above or email hello@ayumonk.com. We run a 20-minute live walkthrough on data shaped like your org."],
 [/challenge|gamif|game|points|leaderboard/i,"42+ gamified challenges — steps, hydration, mindfulness, sleep — with streaks and leaderboards. Completion data feeds your engagement index automatically."],
 [/login|sign in|account/i,"Existing customer? The Log in button top-right routes you to your workspace dashboard."],
 [/kpi|roi|productivity|absent|engag|metric|satisf/i,"We measure employee satisfaction and team wellness alongside the three business KPIs — Productivity, Engagement and Absenteeism — all correlated with participation so ROI is demonstrable, not asserted."],
 [/role|admin|hr|cxo|hierarch/i,"Four role-based cockpits: Platform Admin, Company Admin, HR/CXO, and Employee — each sees exactly its slice, nothing more."],
 [/employee|app|see|experience/i,"Employees get a personal wellness app: a Wellness Index, their Prakriti dosha profile, daily missions, mood check-ins, XP levels, badges and a weekly leaderboard — all guided by diet plans, yoga and natural wellness suggestions."],
 [/what is|about|ayumonk|how/i,"Ayumonk is a corporate wellness intelligence platform. Eight program tracks — yoga, exercise, hydration, sleep, dosha diets, symptom-based nutrition, condition care, preventive care — converted into productivity, engagement and absenteeism analytics."],
];
const FALL="Happy to help — ask about yoga, diet plans, preventive care, KPIs, privacy, or booking a demo.";
const CHIPS=["What do employees see?","What programs are included?","How is data protected?","Book a demo"];
const body=document.getElementById('body'),inp=document.getElementById('inp');
function add(t,cls){const d=document.createElement('div');d.className='msg '+cls;d.textContent=t;body.appendChild(d);body.scrollTop=body.scrollHeight;}
function chips(){const c=document.createElement('div');c.className='chips';CHIPS.forEach(x=>{const b=document.createElement('button');b.textContent=x;b.onclick=()=>ask(x);c.appendChild(b)});body.appendChild(c);body.scrollTop=body.scrollHeight;}
function reply(q){for(const[r,a]of REPLIES){if(r.test(q))return a}return FALL}
function ask(q){add(q,'user');setTimeout(()=>add(reply(q),'bot'),450)}
document.getElementById('fab').onclick=()=>{const p=document.getElementById('panel');p.classList.toggle('open');if(!body.hasChildNodes()){add("Hello — I'm Ayu, the Ayumonk assistant. What would you like to know?",'bot');chips();}};
document.getElementById('send').onclick=()=>{if(inp.value.trim()){ask(inp.value.trim());inp.value=''}};
inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&inp.value.trim()){ask(inp.value.trim());inp.value=''}});

// "Log in" buttons: when this page is embedded in the SPA (an iframe), ask the
// parent app to open the login Dialog instead of navigating to /login. When
// opened standalone (no parent frame), fall back to the plain /login link.
var framed = window.parent && window.parent !== window;
document.querySelectorAll('.js-login').forEach(function(el){
  el.addEventListener('click', function(e){
    if(framed){
      e.preventDefault();
      window.parent.postMessage({type:'ayumonk:open-login'}, window.location.origin);
    }
    // else: let the default href="/login" navigation happen.
  });
});
