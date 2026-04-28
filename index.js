<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Dashboard de Ligações</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap" rel="stylesheet"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg: #0e0e0f;
      --surface: #18181b;
      --surface2: #1f1f24;
      --border: rgba(255,255,255,0.07);
      --accent: #00e5a0;
      --accent2: #3d8bff;
      --text: #f0f0f0;
      --muted: #888;
      --danger: #ff5c5c;
      --warn: #f5a623;
      --font-head: 'Syne', sans-serif;
      --font-mono: 'DM Mono', monospace;
    }

    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-head);
      min-height: 100vh;
      padding: 2rem 1.5rem;
      max-width: 900px;
      margin: 0 auto;
    }

    header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
      flex-wrap: wrap;
      gap: 12px;
    }

    header h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
    header p { font-size: 12px; color: var(--muted); font-family: var(--font-mono); margin-top: 4px; }

    .badge {
      font-family: var(--font-mono);
      font-size: 11px;
      padding: 5px 12px;
      border-radius: 99px;
      border: 1px solid;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .badge::before { content: ''; width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
    .badge.ok { color: var(--accent); border-color: rgba(0,229,160,0.3); background: rgba(0,229,160,0.07); }
    .badge.ok::before { background: var(--accent); }
    .badge.err { color: var(--danger); border-color: rgba(255,92,92,0.3); background: rgba(255,92,92,0.07); }
    .badge.err::before { background: var(--danger); }
    .badge.loading { color: var(--accent2); border-color: rgba(61,139,255,0.3); background: rgba(61,139,255,0.07); }
    .badge.loading::before { background: var(--accent2); animation: pulse 1s infinite; }

    @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }

    .tabs { display: flex; gap: 4px; margin-bottom: 1.5rem; background: var(--surface); border-radius: 10px; padding: 4px; width: fit-content; }
    .tab {
      font-size: 13px; font-family: var(--font-mono);
      padding: 7px 18px; border-radius: 7px; cursor: pointer;
      color: var(--muted); border: none; background: transparent; transition: all 0.2s;
    }
    .tab:hover { color: var(--text); }
    .tab.active { background: var(--surface2); color: var(--accent); border: 1px solid rgba(0,229,160,0.2); }

    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 2rem; }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 12px; padding: 1.25rem; position: relative; overflow: hidden;
    }
    .card::after { content:''; position:absolute; top:0;left:0;right:0; height:2px; background:var(--accent); opacity:0.4; }
    .card-label { font-size: 11px; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
    .card-value { font-size: 28px; font-weight: 700; line-height: 1; margin-bottom: 6px; }
    .card-sub { font-size: 12px; font-family: var(--font-mono); color: var(--muted); }
    .card-sub.ok { color: var(--accent); }
    .card-sub.warn { color: var(--warn); }

    .section { margin-bottom: 2rem; }
    .section-title { font-size: 11px; font-family: var(--font-mono); color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 1rem; }

    .meta-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem; }
    .meta-row { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
    .meta-label { font-size: 13px; font-family: var(--font-mono); color: var(--text); width: 50px; flex-shrink: 0; }
    .meta-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.08); border-radius: 99px; overflow: hidden; }
    .meta-bar { height: 100%; border-radius: 99px; transition: width 0.6s ease; }
    .meta-val { font-size: 12px; font-family: var(--font-mono); color: var(--muted); width: 80px; text-align: right; }
    .meta-pct { font-size: 12px; font-family: var(--font-mono); width: 38px; text-align: right; flex-shrink: 0; }

    .input-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .input-row label { font-size: 13px; font-family: var(--font-mono); color: var(--muted); width: 130px; }
    input[type="number"] {
      background: var(--surface2); border: 1px solid var(--border); color: var(--text);
      border-radius: 8px; padding: 6px 10px; font-size: 13px; font-family: var(--font-mono); width: 80px; outline: none;
    }
    input[type="number"]:focus { border-color: var(--accent); }
    input[type="text"] {
      background: var(--surface2); border: 1px solid var(--border); color: var(--text);
      border-radius: 8px; padding: 6px 10px; font-size: 12px; font-family: var(--font-mono);
      width: 100%; max-width: 480px; outline: none;
    }
    input[type="text"]:focus { border-color: var(--accent); }

    .chart-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1.25rem; margin-bottom: 2rem; }
    .chart-legend { display: flex; gap: 16px; margin-bottom: 1rem; font-size: 12px; font-family: var(--font-mono); color: var(--muted); }
    .chart-legend span { display: flex; align-items: center; gap: 6px; }
    .dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; }

    table { width: 100%; border-collapse: collapse; font-size: 13px; font-family: var(--font-mono); }
    th { text-align: left; color: var(--muted); font-weight: 400; padding: 8px 10px; border-bottom: 1px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 10px 10px; border-bottom: 1px solid var(--border); color: var(--text); }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: var(--surface2); }
    .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; margin-bottom: 2rem; }

    .pill { font-size: 11px; padding: 3px 10px; border-radius: 99px; font-family: var(--font-mono); }
    .pill.sim { background: rgba(0,229,160,0.1); color: var(--accent); border: 1px solid rgba(0,229,160,0.2); }
    .pill.nao { background: rgba(255,92,92,0.1); color: var(--danger); border: 1px solid rgba(255,92,92,0.2); }

    .btn-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 2rem; }
    button {
      background: transparent; border: 1px solid var(--border); color: var(--text);
      border-radius: 8px; padding: 10px 18px; font-size: 13px; font-family: var(--font-mono);
      cursor: pointer; transition: all 0.2s;
    }
    button:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,229,160,0.05); }
    button:active { transform: scale(0.98); }
    .btn-primary { background: var(--accent); color: #000; border-color: var(--accent); font-weight: 500; }
    .btn-primary:hover { background: #00cc8a; border-color: #00cc8a; color: #000; }

    footer { margin-top: 2rem; font-size: 11px; font-family: var(--font-mono); color: rgba(255,255,255,0.15); text-align: center; }
  </style>
</head>
<body>

<header>
  <div>
    <h1>Dashboard de Ligações</h1>
    <p id="last-update">aguardando dados...</p>
  </div>
  <span class="badge loading" id="status-badge">conectando</span>
</header>

<div class="tabs">
  <button class="tab active" id="tab-hoje" onclick="setTab('hoje')">Hoje</button>
  <button class="tab" id="tab-semana" onclick="setTab('semana')">Esta semana</button>
</div>

<div class="meta-wrap">
  <p class="section-title">Configurar meta</p>
  <div class="input-row" style="margin-bottom:0;">
    <label>Meta diária:</label>
    <input type="number" id="meta-diaria" value="40" min="1" oninput="renderTudo()" />
  </div>
</div>

<!-- VIEW HOJE -->
<div id="view-hoje">
  <div class="cards">
    <div class="card">
      <p class="card-label">Ligações únicas</p>
      <p class="card-value" id="val-unicas">—</p>
      <p class="card-sub ok">hoje</p>
    </div>
    <div class="card">
      <p class="card-label">Taxa de atendimento</p>
      <p class="card-value" id="val-taxa">—</p>
      <p class="card-sub" id="sub-taxa">aguardando</p>
    </div>
    <div class="card">
      <p class="card-label">Duração média</p>
      <p class="card-value" id="val-dur">—</p>
      <p class="card-sub ok">das atendidas</p>
    </div>
    <div class="card">
      <p class="card-label">Meta do dia</p>
      <p class="card-value" id="val-meta-pct">—</p>
      <p class="card-sub" id="sub-meta">aguardando</p>
    </div>
  </div>

  <div class="section">
    <p class="section-title">Progresso da meta hoje</p>
    <div id="meta-hoje"></div>
  </div>

  <div class="chart-wrap">
    <p class="section-title">Ligações por hora</p>
    <div class="chart-legend">
      <span><span class="dot" style="background:#3d8bff;"></span>Feitas</span>
      <span><span class="dot" style="background:#00e5a0;"></span>Atendidas</span>
    </div>
    <div style="position:relative;width:100%;height:200px;">
      <canvas id="grafico-hoje"></canvas>
    </div>
  </div>

  <div class="section">
    <p class="section-title">Últimas ligações</p>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Horário</th><th>Destino</th><th>Duração</th><th>Atendida</th></tr></thead>
        <tbody id="tabela-body"><tr><td colspan="4" style="color:var(--muted);">Carregando...</td></tr></tbody>
      </table>
    </div>
  </div>
</div>

<!-- VIEW SEMANA -->
<div id="view-semana" style="display:none;">
  <div class="cards">
    <div class="card">
      <p class="card-label">Total na semana</p>
      <p class="card-value" id="val-semana-total">—</p>
      <p class="card-sub ok">ligações únicas</p>
    </div>
    <div class="card">
      <p class="card-label">Média por dia</p>
      <p class="card-value" id="val-semana-media">—</p>
      <p class="card-sub ok">dias com atividade</p>
    </div>
    <div class="card">
      <p class="card-label">Melhor dia</p>
      <p class="card-value" id="val-semana-melhor">—</p>
      <p class="card-sub ok">ligações</p>
    </div>
    <div class="card">
      <p class="card-label">Meta semanal</p>
      <p class="card-value" id="val-semana-meta">—</p>
      <p class="card-sub" id="sub-semana-meta">aguardando</p>
    </div>
  </div>

  <div class="section">
    <p class="section-title">Progresso diário — % da meta</p>
    <div id="meta-semana"></div>
  </div>

  <div class="chart-wrap">
    <p class="section-title">Ligações por dia da semana</p>
    <div class="chart-legend">
      <span><span class="dot" style="background:#3d8bff;"></span>Feitas</span>
      <span><span class="dot" style="background:#00e5a0;"></span>Atendidas</span>
    </div>
    <div style="position:relative;width:100%;height:200px;">
      <canvas id="grafico-semana"></canvas>
    </div>
  </div>
</div>

<!-- CONFIG -->
<div class="section">
  <p class="section-title">URL do servidor</p>
  <input type="text" id="server-url" value="https://upbeat-miracle-production.up.railway.app" />
</div>

<div class="btn-row">
  <button class="btn-primary" onclick="buscarTudo()">↻ Atualizar dados</button>
</div>

<footer>dashboard-ligações • atualiza a cada 60s • fuso: America/Fortaleza</footer>

<script>
  const TZ = 'America/Fortaleza';
  const DIAS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  let chartHoje, chartSemana;
  let dadosHoje = [];
  let dadosSemana = {};

  function getServer() { return document.getElementById('server-url').value.trim().replace(/\/$/, ''); }
  function getMeta() { return parseInt(document.getElementById('meta-diaria').value) || 40; }

  function setTab(tab) {
    document.getElementById('view-hoje').style.display = tab === 'hoje' ? 'block' : 'none';
    document.getElementById('view-semana').style.display = tab === 'semana' ? 'block' : 'none';
    document.getElementById('tab-hoje').className = 'tab' + (tab === 'hoje' ? ' active' : '');
    document.getElementById('tab-semana').className = 'tab' + (tab === 'semana' ? ' active' : '');
  }

  function formatDur(s) {
    if (!s || parseInt(s) === 0) return '—';
    const sec = parseInt(s);
    const m = Math.floor(sec / 60), r = sec % 60;
    return m > 0 ? `${m}m ${r}s` : `${r}s`;
  }

  function formatHora(dt) {
    if (!dt) return '—';
    return new Date(dt.replace(' ', 'T')).toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit', second:'2-digit', timeZone: TZ });
  }

  function formatDest(n) {
    if (!n) return '—';
    const s = String(n).replace(/\D/g, '');
    if (s.length >= 10) { const l = s.slice(-10); return `(${l.slice(0,2)}) ${l.slice(2,6)}-${l.slice(6)}`; }
    return n;
  }

  function hojeData() {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }

  function getSemanaDatas() {
    const hoje = new Date(new Date().toLocaleString('en-US', { timeZone: TZ }));
    const diaSemana = hoje.getDay();
    return [1,2,3,4,5,6].map(i => {
      const d = new Date(hoje);
      d.setDate(hoje.getDate() - diaSemana + i);
      const dd = String(d.getDate()).padStart(2,'0');
      const mm = String(d.getMonth()+1).padStart(2,'0');
      return { label: DIAS_PT[i], data: `${dd}/${mm}/${d.getFullYear()}`, isHoje: i === diaSemana };
    });
  }

  function corPct(pct) {
    return pct >= 100 ? '#00e5a0' : pct >= 75 ? '#3d8bff' : pct >= 50 ? '#f5a623' : '#ff5c5c';
  }

  function renderTudo() { renderHoje(); renderSemana(); }

  function renderHoje() {
    const ligacoes = dadosHoje;
    const meta = getMeta();
    const unicas = new Set(ligacoes.map(l => l.id));
    const atendidas = ligacoes.filter(l => l.atendida && l.duracao && parseInt(l.duracao) > 0);
    const taxa = unicas.size > 0 ? Math.round((atendidas.length / unicas.size) * 100) : 0;
    const durMedia = atendidas.length > 0 ? Math.round(atendidas.reduce((a,b) => a + parseInt(b.duracao||0), 0) / atendidas.length) : 0;
    const pctMeta = Math.min(100, Math.round((unicas.size / meta) * 100));
    const cor = corPct(pctMeta);

    document.getElementById('val-unicas').textContent = unicas.size;
    document.getElementById('val-taxa').textContent = taxa + '%';
    document.getElementById('sub-taxa').textContent = taxa >= 70 ? 'meta atingida ✓' : 'meta: 70%';
    document.getElementById('sub-taxa').className = 'card-sub ' + (taxa >= 70 ? 'ok' : 'warn');
    document.getElementById('val-dur').textContent = formatDur(durMedia);
    document.getElementById('val-meta-pct').textContent = pctMeta + '%';
    document.getElementById('sub-meta').textContent = `${unicas.size} de ${meta}`;
    document.getElementById('sub-meta').className = 'card-sub ' + (pctMeta >= 100 ? 'ok' : 'warn');

    document.getElementById('meta-hoje').innerHTML = `
      <div class="meta-row">
        <span class="meta-label">Hoje</span>
        <div class="meta-bar-bg"><div class="meta-bar" style="width:${pctMeta}%;background:${cor};"></div></div>
        <span class="meta-val">${unicas.size} / ${meta}</span>
        <span class="meta-pct" style="color:${cor};">${pctMeta}%</span>
      </div>
      <p style="font-size:12px;font-family:var(--font-mono);color:${cor};margin-top:8px;">
        ${pctMeta >= 100 ? '🎯 Meta atingida!' : `Faltam ${meta - unicas.size} ligações para a meta`}
      </p>`;

    const porHora = {}, atendidasPorHora = {};
    ligacoes.forEach(l => {
      if (!l.inicio) return;
      const h = new Date(l.inicio.replace(' ','T')).getHours();
      porHora[h] = (porHora[h]||0) + 1;
      if (l.atendida) atendidasPorHora[h] = (atendidasPorHora[h]||0) + 1;
    });
    const horas = Object.keys(porHora).map(Number).sort((a,b)=>a-b);
    if (chartHoje) chartHoje.destroy();
    chartHoje = new Chart(document.getElementById('grafico-hoje'), {
      type: 'bar',
      data: {
        labels: horas.length > 0 ? horas.map(h=>`${h}h`) : ['—'],
        datasets: [
          { label:'Feitas', data: horas.map(h=>porHora[h]||0), backgroundColor:'#3d8bff', borderRadius:4 },
          { label:'Atendidas', data: horas.map(h=>atendidasPorHora[h]||0), backgroundColor:'#00e5a0', borderRadius:4 }
        ]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales: {
          x:{ticks:{color:'#888',font:{size:12,family:'DM Mono'}},grid:{color:'rgba(255,255,255,0.05)'}},
          y:{ticks:{color:'#888',font:{size:12,family:'DM Mono'},stepSize:1},grid:{color:'rgba(255,255,255,0.05)'}}
        }
      }
    });

    const recentes = [...ligacoes].reverse().slice(0,15);
    document.getElementById('tabela-body').innerHTML = recentes.length === 0
      ? '<tr><td colspan="4" style="color:var(--muted);">Nenhuma ligação hoje ainda.</td></tr>'
      : recentes.map(l => `<tr>
          <td>${formatHora(l.inicio)}</td>
          <td>${formatDest(l.destino)}</td>
          <td>${formatDur(l.duracao)}</td>
          <td><span class="pill ${l.atendida?'sim':'nao'}">${l.atendida?'sim':'não'}</span></td>
        </tr>`).join('');
  }

  function renderSemana() {
    const meta = getMeta();
    const hoje = hojeData();
    const dias = getSemanaDatas();

    let totalSemana = 0, melhorDia = 0, diasComAtividade = 0;

    const rows = dias.map(({ label, data }) => {
      const ligs = dadosSemana[data] || [];
      const unicas = new Set(ligs.map(l => l.id)).size;
      const atend = ligs.filter(l => l.atendida && l.duracao && parseInt(l.duracao) > 0).length;
      const pct = Math.min(100, Math.round((unicas / meta) * 100));
      if (unicas > 0) diasComAtividade++;
      totalSemana += unicas;
      if (unicas > melhorDia) melhorDia = unicas;
      return { label, data, unicas, atend, pct, cor: corPct(pct), isHoje: data === hoje };
    });

    const metaSemanal = meta * 5;
    const pctSemana = Math.min(100, Math.round((totalSemana / metaSemanal) * 100));
    const media = diasComAtividade > 0 ? Math.round(totalSemana / diasComAtividade) : 0;

    document.getElementById('val-semana-total').textContent = totalSemana;
    document.getElementById('val-semana-media').textContent = media;
    document.getElementById('val-semana-melhor').textContent = melhorDia;
    document.getElementById('val-semana-meta').textContent = pctSemana + '%';
    document.getElementById('sub-semana-meta').textContent = `${totalSemana} de ${metaSemanal}`;
    document.getElementById('sub-semana-meta').className = 'card-sub ' + (pctSemana >= 100 ? 'ok' : 'warn');

    document.getElementById('meta-semana').innerHTML = rows.map(r => `
      <div class="meta-row" style="opacity:${r.isHoje?'1':'0.75'};">
        <span class="meta-label" style="color:${r.isHoje?'var(--accent)':'var(--text)'};">${r.label}${r.isHoje?' ●':''}</span>
        <div class="meta-bar-bg"><div class="meta-bar" style="width:${r.pct}%;background:${r.cor};"></div></div>
        <span class="meta-val">${r.unicas} / ${meta}</span>
        <span class="meta-pct" style="color:${r.cor};">${r.pct}%</span>
      </div>`).join('');

    if (chartSemana) chartSemana.destroy();
    chartSemana = new Chart(document.getElementById('grafico-semana'), {
      type: 'bar',
      data: {
        labels: rows.map(r => r.label),
        datasets: [
          { label:'Feitas', data: rows.map(r=>r.unicas), backgroundColor: rows.map(r=>r.isHoje?'#3d8bff':'rgba(61,139,255,0.45)'), borderRadius:4 },
          { label:'Atendidas', data: rows.map(r=>r.atend), backgroundColor: rows.map(r=>r.isHoje?'#00e5a0':'rgba(0,229,160,0.35)'), borderRadius:4 }
        ]
      },
      options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales: {
          x:{ticks:{color:'#888',font:{size:13,family:'DM Mono'}},grid:{color:'rgba(255,255,255,0.05)'}},
          y:{ticks:{color:'#888',font:{size:12,family:'DM Mono'},stepSize:1},grid:{color:'rgba(255,255,255,0.05)'}}
        }
      }
    });
  }

  async function buscarTudo() {
    const badge = document.getElementById('status-badge');
    badge.textContent = 'conectando';
    badge.className = 'badge loading';
    try {
      const resHoje = await fetch(`${getServer()}/dados`);
      const jsonHoje = await resHoje.json();
      dadosHoje = jsonHoje.ligacoes || [];

      const dias = getSemanaDatas();
      const resultados = await Promise.all(dias.map(({ data }) =>
        fetch(`${getServer()}/dados?data=${encodeURIComponent(data)}`)
          .then(r => r.json()).then(j => ({ data, ligacoes: j.ligacoes || [] }))
          .catch(() => ({ data, ligacoes: [] }))
      ));
      dadosSemana = {};
      resultados.forEach(({ data, ligacoes }) => { dadosSemana[data] = ligacoes; });

      renderTudo();
      badge.textContent = 'ao vivo';
      badge.className = 'badge ok';
      document.getElementById('last-update').textContent = `atualizado às ${new Date().toLocaleTimeString('pt-BR')}`;
    } catch(e) {
      badge.textContent = 'erro de conexão';
      badge.className = 'badge err';
      document.getElementById('tabela-body').innerHTML = '<tr><td colspan="4" style="color:var(--danger);">Não foi possível conectar ao servidor.</td></tr>';
    }
  }

  buscarTudo();
  setInterval(buscarTudo, 60000);
</script>
</body>
</html>
