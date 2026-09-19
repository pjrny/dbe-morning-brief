const $ = (s) => document.querySelector(s);
const tabs = document.querySelectorAll("nav button");
let selectedBooks = [];
let date = new Date().toISOString().slice(0,10);

tabs.forEach((b) => b.addEventListener("click", () => {
  tabs.forEach((x) => x.classList.remove("active"));
  b.classList.add("active");
  $("#tab-play").hidden = b.dataset.tab !== "play";
  $("#tab-dbe").hidden = b.dataset.tab !== "dbe";
}));

$("#date").value = date;
$("#date").addEventListener("change", () => { date = $("#date").value; loadBrief(); });
$("#today").addEventListener("click", () => {
  date = new Date().toISOString().slice(0,10);
  $("#date").value = date;
  loadBrief();
});

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function pick4(d) {
  const pool = BOOKS.slice();
  const out = [];
  let seed = hash(d + "|dbe-brief");
  while (out.length < 4 && pool.length) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    out.push(pool.splice(seed % pool.length, 1)[0]);
  }
  return out;
}

function vizHTML(kind) {
  if (kind === "cycle") return `<div class="cycle"></div>`;
  if (kind === "compound") return `<div class="compound">${"<span></span>".repeat(12)}</div>`;
  return `<div class="viz">${[0,1,2,3,4,5,6].map((i)=>`<div class="bar" style="left:${12+i*16}px;animation-delay:${i*.12}s"></div>`).join("")}</div>`;
}

function renderCards(books) {
  $("#cards").innerHTML = books.map((b) => `
    <article class="card">
      <div class="meta">${b.section} · source page ${b.page}</div>
      <h3>${b.title}</h3>
      <div class="meta">${b.author}</div>
      ${vizHTML(b.viz)}
      <p>${b.excerpt}</p>
      <p><strong>Rule:</strong> ${b.rule}</p>
      <p><strong>KBI:</strong> ${b.metric}</p>
      <p>${b.links.map((u)=>`<a href="${u}" target="_blank" rel="noopener">more</a>`).join(" · ")}</p>
    </article>`).join("");
}

function renderDbe() {
  $("#scholar").innerHTML = DBE_SCHOLAR.map((a) => `
    <div class="item ${a.stance}">
      <strong>${a.title}</strong> (${a.year}, ${a.venue}) · <em>${a.stance}</em><br/>
      ${a.why}<br/>
      <span class="meta">${a.community}</span> · <a href="${a.url}" target="_blank" rel="noopener">open</a>
    </div>`).join("");
  $("#news").innerHTML = DBE_NEWS.map((n) => `<div class="item"><a href="${n.url}" target="_blank">${n.title}</a> · ${n.kind}</div>`).join("");
  $("#learn").innerHTML = DBE_LEARN.map((n) => `<div class="item"><a href="${n.url}" target="_blank">${n.title}</a> · ${n.kind}</div>`).join("");
}

const SCENES = [
  {s:"A hard project appears. Do you…", opts:[
    {t:"Treat it as proof you lack talent and hide.", tags:[]},
    {t:"Say not yet, run one tiny experiment, protect a deep block.", tags:["mindset","beyond-belief","deep-work","lean","scout"]},
    {t:"Say yes to every extra meeting so you look busy.", tags:[]}
  ]},
  {s:"Your calendar is packed with low-value tasks.", opts:[
    {t:"Do the 20% that moves the KBI; decline the rest.", tags:["80-20","essentialism","one-thing"]},
    {t:"Keep all of it to avoid disappointing anyone.", tags:[]},
    {t:"Start three new side quests.", tags:[]}
  ]},
  {s:"A negotiation / conflict lands on your desk.", opts:[
    {t:"Label the emotion, own the outcome, ask a calibrated question.", tags:["never-split","extreme-ownership","influence"]},
    {t:"Split the difference immediately to end discomfort.", tags:[]},
    {t:"Blame the other team in writing.", tags:[]}
  ]},
  {s:"Progress is slow after two weeks.", opts:[
    {t:"Keep the identity habit, stay in the flow channel, add a small stressor you can learn from.", tags:["atomic-habits","grit","flow","antifragile"]},
    {t:"Quit because talent should have made it easy.", tags:[]},
    {t:"Rebuild the whole system from scratch tonight.", tags:[]}
  ]},
  {s:"Your mind is noisy with open loops.", opts:[
    {t:"Capture, next-action, then one deep block.", tags:["gtd","deep-work","one-thing"]},
    {t:"Refresh feeds until the anxiety drops.", tags:[]},
    {t:"Promise five people new deliverables.", tags:[]}
  ]}
];

let turn = 0, score = 0, log = [];

function startSim() {
  turn = 0; score = 0; log = [];
  $("#kbi").textContent = selectedBooks.map((b)=>b.metric).join(" · ");
  nextQ();
}

function nextQ() {
  if (turn >= SCENES.length) {
    const win = score >= 1;
    $("#question").innerHTML = win
      ? `<p class="win">KBI cleared. One aligned page-rule was enough. Score ${score}/${SCENES.length}.</p>`
      : `<p class="lose">No aligned rule applied. Replay and pick any option that matches one of today's four pages.</p>`;
    $("#choices").innerHTML = `<button class="ghost" id="replay">Replay</button>`;
    $("#replay").onclick = startSim;
    return;
  }
  const scene = SCENES[turn];
  $("#question").textContent = scene.s;
  $("#choices").innerHTML = scene.opts.map((o,i)=>`<button data-i="${i}">${o.t}</button>`).join("");
  $("#choices").onclick = (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const opt = scene.opts[+btn.dataset.i];
    const hit = opt.tags.some((t) => selectedBooks.some((b)=>b.id===t));
    if (hit) score++;
    log.push(hit ? "aligned" : "miss");
    turn++;
    nextQ();
  };
}

async function loadBrief() {
  try {
    const r = await fetch(`/api/brief?date=${date}`);
    if (r.ok) {
      const j = await r.json();
      selectedBooks = j.selected.map((id)=>BOOKS.find((b)=>b.id===id)).filter(Boolean);
    } else throw 0;
  } catch {
    selectedBooks = pick4(date);
  }
  $("#stamp").textContent = `Morning Brief ${date}`;
  renderCards(selectedBooks);
  startSim();
}

renderDbe();
loadBrief();
