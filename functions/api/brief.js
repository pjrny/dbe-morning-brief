function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick4(date, ids) {
  const pool = ids.slice();
  const out = [];
  let seed = hash(date + "|dbe-brief");
  while (out.length < 4 && pool.length) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const i = seed % pool.length;
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const today = new Date().toISOString().slice(0, 10);
  const date = url.searchParams.get("date") || today;
  const ids = [
    "mindset","beyond-belief","atomic-habits","deep-work","essentialism","grit",
    "one-thing","gtd","influence","lean","extreme-ownership","never-split",
    "80-20","antifragile","flow","scout"
  ];
  const selected = pick4(date, ids);
  return Response.json({
    date,
    today,
    selected,
    historyHint: "Pass ?date=YYYY-MM-DD to replay any Morning Brief."
  }, {
    headers: {
      "cache-control": "public, max-age=60",
      "access-control-allow-origin": "*"
    }
  });
}
