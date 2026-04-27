const express = require('express');
const app = express();
app.use(express.json());

const ligacoes = [];

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
  res.json({ total: ligacoes.length, ligacoes });
});

app.get('/', (req, res) => {
  res.send('Servidor de ligações rodando!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
