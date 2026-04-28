<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard de Ligações v2</title>

  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>

  <style>
    body { background:#0e0e0f; color:#fff; font-family: 'Syne'; padding:20px;}
    .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:10px;}
    .card { background:#18181b; padding:15px; border-radius:10px;}
    .label { font-size:11px; color:#888;}
    .value { font-size:22px; font-weight:bold;}
    .ok { color:#00e5a0;}
    .warn { color:#f5a623;}
    .danger { color:#ff5c5c;}
  </style>
</head>

<body>

<h2>📊 Dashboard de Ligações v2</h2>

<div class="cards">

  <div class="card">
    <div class="label">Ligações únicas</div>
    <div class="value" id="unicas">-</div>
  </div>

  <div class="card">
    <div class="label">Taxa atendimento</div>
    <div class="value" id="taxa">-</div>
  </div>

  <div class="card">
    <div class="label">Conversão</div>
    <div class="value" id="conv">-</div>
  </div>

  <div class="card">
    <div class="label">Fechamento</div>
    <div class="value" id="fech">-</div>
  </div>

  <div class="card">
    <div class="label">Eficiência</div>
    <div class="value" id="efic">-</div>
  </div>

  <div class="card">
    <div class="label">% ≥30s</div>
    <div class="value" id="q30">-</div>
  </div>

  <div class="card">
    <div class="label">% ≥60s</div>
    <div class="value" id="q60">-</div>
  </div>

  <div class="card">
    <div class="label">Melhor horário</div>
    <div class="value" id="melhor">-</div>
  </div>

  <div class="card">
    <div class="label">Pior horário</div>
    <div class="value" id="pior">-</div>
  </div>

</div>

<br>
<button onclick="buscar()">Atualizar</button>

<script>

const SERVER = "https://upbeat-miracle-production.up.railway.app";

function dataHoje() {
  return new Date().toLocaleDateString('pt-BR');
}

async function buscar() {
  const res = await fetch(`${SERVER}/dados?data=${dataHoje()}`);
  const json = await res.json();
  processar(json.ligacoes || []);
}

function processar(ligacoes) {

  const unicas = new Set(ligacoes.map(l=>l.id));
  const atendidas = ligacoes.filter(l=>l.atendida && l.duracao>0);

  const taxa = unicas.size ? Math.round((atendidas.length/unicas.size)*100) : 0;

  // 🔥 conversão
  const conversoes = ligacoes.filter(l=>l.converteu).length;
  const vendas = ligacoes.filter(l=>l.venda).length;

  const taxaConv = unicas.size ? Math.round((conversoes/unicas.size)*100) : 0;
  const taxaFech = conversoes ? Math.round((vendas/conversoes)*100) : 0;

  // 🔥 eficiência
  const eficiencia = conversoes ? (ligacoes.length/conversoes).toFixed(1) : "-";

  // 🔥 qualidade
  const q30 = Math.round((ligacoes.filter(l=>l.duracao>=30).length/ligacoes.length)*100) || 0;
  const q60 = Math.round((ligacoes.filter(l=>l.duracao>=60).length/ligacoes.length)*100) || 0;

  // 🔥 ranking hora
  const porHora={}, atendHora={};

  ligacoes.forEach(l=>{
    if(!l.inicio) return;
    const h = new Date(l.inicio).getHours();
    porHora[h]=(porHora[h]||0)+1;
    if(l.atendida) atendHora[h]=(atendHora[h]||0)+1;
  });

  let melhor='-';
  let pior='-';
  let best=0;
  let worst=1;

  Object.keys(porHora).forEach(h=>{
    const taxa = (atendHora[h]||0)/porHora[h];
    if(taxa>best){best=taxa;melhor=h+'h';}
    if(taxa<worst){worst=taxa;pior=h+'h';}
  });

  // UI
  set("unicas", unicas.size);
  set("taxa", taxa+'%');
  set("conv", taxaConv+'%');
  set("fech", taxaFech+'%');
  set("efic", eficiencia);
  set("q30", q30+'%');
  set("q60", q60+'%');
  set("melhor", melhor);
  set("pior", pior);
}

function set(id, val){
  document.getElementById(id).innerText = val;
}

buscar();
setInterval(buscar,60000);

</script>

</body>
</html>
