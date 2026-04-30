const express = require('express');
const { Pool } = require('pg');

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:xALIjzqexAuGQJJbPvnrGGbdrTVFjywM@postgres.railway.internal:5432/railway',
  ssl: false
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS ligacoes (
      id SERIAL PRIMARY KEY,
      ligacao_id TEXT,
      inicio TIMESTAMP,
      fim TIMESTAMP,
      duracao INTEGER,
      atendida BOOLEAN,
      origem TEXT,
      destino TEXT
    )
  `);
  console.log('Banco pronto!');
}

app.post('/webhook', async (req, res) => {
  const c = req.body;
  try {
    await pool.query(
      `INSERT INTO ligacoes (ligacao_id, inicio, fim, duracao, atendida, origem, destino)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        c.id,
        c.startedAt || null,
        c.endedAt || null,
        c.duration ? parseInt(c.duration) : 0,
        c.answeredAt ? true : false,
        c.caller || null,
        c.called || null
      ]
    );
    console.log('Ligação salva:', c.id);
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error('Erro ao salvar:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

app.get('/dados', async (req, res) => {
  const { periodo, mes, ano } = req.query;
  const tz = `AT TIME ZONE 'America/Fortaleza'`;

  try {
    let query, result;

    if (periodo === 'semanas-do-mes') {
      query = `
        SELECT
          date_trunc('week', (inicio ${tz})::timestamp) AS semana,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE atendida = true AND duracao > 0) AS atendidas,
          COUNT(DISTINCT ligacao_id) AS unicas
        FROM ligacoes
        WHERE inicio >= date_trunc('month', NOW() ${tz})
          AND inicio < date_trunc('month', NOW() ${tz}) + INTERVAL '1 month'
        GROUP BY semana
        ORDER BY semana
      `;
      result = await pool.query(query);
      return res.json({ semanas: result.rows });
    }

    if (periodo === 'mes') {
      const m = mes ? parseInt(mes) : new Date().getMonth() + 1;
      const a = ano ? parseInt(ano) : new Date().getFullYear();
      query = `
        SELECT *, ligacao_id AS lid FROM ligacoes
        WHERE EXTRACT(MONTH FROM inicio ${tz}) = $1
          AND EXTRACT(YEAR FROM inicio ${tz}) = $2
        ORDER BY inicio DESC
      `;
      result = await pool.query(query, [m, a]);
      return res.json({ total: result.rows.length, ligacoes: result.rows.map(r => ({...r, id: r.lid})) });
    }

    if (periodo === 'semana') {
      query = `
        SELECT *, ligacao_id AS lid FROM ligacoes
        WHERE inicio >= date_trunc('week', NOW() ${tz})
        ORDER BY inicio DESC
      `;
      result = await pool.query(query);
      return res.json({ total: result.rows.length, ligacoes: result.rows.map(r => ({...r, id: r.lid})) });
    }

    query = `
      SELECT *, ligacao_id AS lid FROM ligacoes
      WHERE (inicio ${tz})::date = (NOW() ${tz})::date
      ORDER BY inicio DESC
    `;
    result = await pool.query(query);
    return res.json({ total: result.rows.length, ligacoes: result.rows.map(r => ({...r, id: r.lid})) });

  } catch (e) {
    console.error('Erro ao buscar:', e.message);
    res.status(500).json({ erro: e.message });
  }
});

app.get('/', (req, res) => {
  res.send('Servidor de ligações rodando!');
});

const PORT = process.env.PORT || 8080;
init().then(() => {
  app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
});
