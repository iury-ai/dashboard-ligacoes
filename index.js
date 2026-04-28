const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

const ligacoes = [];

function hojeStr() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' });
}

function dataDaLigacao(ligacao) {
  const dt = ligacao.inicio || ligacao.startedAt;
  if (!dt) return null;
  return new Date(dt.replace(' ', 'T')).toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' });
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
  const data = req.query.data; // formato: DD/MM/YYYY
  const filtradas = data
    ? ligacoes.filter(l => dataDaLigacao(l) === data)
    : ligacoes.filter(l => dataDaLigacao(l) === hojeStr());

  res.json({ total: filtradas.length, ligacoes: filtradas, data: data || hojeStr() });
});

app.get('/', (req, res) => {
  res.send('Servidor de ligações rodando!');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
