const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

const ligacoes = [];

function toData(dt) {
  if (!dt) return null;
  return new Date(dt.replace(' ', 'T'));
}

function dataFortaleza(date) {
  return new Date(date.toLocaleString('en-US', { timeZone: 'America/Fortaleza' }));
}

app.post('/webhook', (req, res) => {
  const chamada = req.body;
  ligacoes.push({
    id: chamada.id,
    inicio: chamada.startedAt,
    fim: chamada.endedAt,
    duracao: chamada.duration,
    atendida: chamada.answeredAt ? true : false,
    origem: chamada.caller,
    destino: chamada.called,
  });
  console.log('Nova ligação recebida:', chamada.id);
  res.status(200).json({ ok: true });
});

app.get('/dados', (req, res) => {
  const { periodo, data, mes, ano } = req.query;
  const agora = dataFortaleza(new Date());

  let filtradas = ligacoes.filter(l => {
    const d = toData(l.inicio);
    if (!d) return false;
    const df = dataFortaleza(d);

    if (periodo === 'semana') {
      const diaSemana = agora.getDay();
      const seg = new Date(agora);
      seg.setDate(agora.getDate() - (diaSemana === 0 ? 6 : diaSemana - 1));
      seg.setHours(0, 0, 0, 0);
      return df >= seg;
    }

    if (periodo === 'mes') {
      const m = mes ? parseInt(mes) - 1 : agora.getMonth();
      const a = ano ? parseInt(ano) : agora.getFullYear();
      return df.getMonth() === m && df.getFullYear() === a;
    }

    // padrão: dia
    const alvo = data
      ? (() => { const [d,m,a] = data.split('/'); return `${a}-${m}-${d}`; })()
      : agora.toISOString().slice(0, 10);
    const dfStr = df.toISOString().slice(0, 10);
    return dfStr === alvo;
  });

  res.json({ total: filtradas.length, ligacoes: filtradas });
});

app.get('/', (req, res) => {
  res.send('Servidor de ligações rodando!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
