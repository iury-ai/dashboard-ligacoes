const express = require('express');
const { Pool } = require('pg');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

// 🔥 conexão com Postgres
const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL não definida");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
// 🔥 cria tabela automaticamente
async function criarTabela() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ligacoes (
      id SERIAL PRIMARY KEY,
      ligacao_id TEXT UNIQUE,
      inicio TIMESTAMP,
      fim TIMESTAMP,
      duracao INTEGER,
      atendida BOOLEAN,
      origem TEXT,
      destino TEXT,
      criado_em TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("✅ tabela pronta");
}

criarTabela();

// helpers
function hojeStr() {
  return new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Fortaleza' });
}

// 🔥 SALVAR NO BANCO
app.post('/webhook', async (req, res) => {
  const chamada = req.body;

  try {
    await pool.query(
      `INSERT INTO ligacoes 
      (ligacao_id, inicio, fim, duracao, atendida, origem, destino)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (ligacao_id) DO NOTHING`,
      [
        chamada.id,
        chamada.startedAt,
        chamada.endedAt,
        chamada.duration,
        chamada.answeredAt ? true : false,
        chamada.caller,
        chamada.called
      ]
    );

    console.log('Nova ligação salva:', chamada.id);
    res.status(200).json({ ok: true });

  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'erro ao salvar' });
  }
});

// 🔥 BUSCAR DO BANCO
app.get('/dados', async (req, res) => {
  const data = req.query.data;

  try {
    let query;
    let values;

    if (data) {
      query = `
        SELECT * FROM ligacoes
        WHERE DATE(inicio) = TO_DATE($1, 'DD/MM/YYYY')
        ORDER BY inicio DESC
      `;
      values = [data];
    } else {
      query = `
        SELECT * FROM ligacoes
        WHERE DATE(inicio) = CURRENT_DATE
        ORDER BY inicio DESC
      `;
      values = [];
    }

    const result = await pool.query(query, values);

    res.json({
      total: result.rows.length,
      ligacoes: result.rows,
      data: data || hojeStr()
    });

  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: 'erro ao buscar' });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor com Postgres rodando 🚀');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
