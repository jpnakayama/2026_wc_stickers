# Copa 2026 — Controle de Figurinhas

PWA em React (Vite) para o álbum Panini da Copa 2026: **980** figurinhas (48 seleções × 20 + 20 FWC). O estado sincroniza na **nuvem** ([Supabase](https://supabase.com) Postgres): a rota `api/collection/[syncId]` faz GET/PUT de um objeto JSON (`payload`) na tabela **`collections`**. Cada coleção tem um **código de sincronização** (`wc2026_sync_id` no browser). Se a API responder 503 (Supabase não configurado na Vercel) ou falhar a rede, a app usa **modo local** (`localStorage` neste dispositivo).

## Funcionalidades

- **Coleção**: grelha de grupos (2 por linha); bandeiras circulares no **mesmo formato que Estatísticas** (PNG [flagcdn](https://flagpedia.net/download/api), `TeamFlag` 36×36, `object-fit: cover`); toque na bandeira abre o painel de figurinhas em largura total **abaixo do par de grupos** (o grupo ao lado mantém-se na mesma linha).
- **Ecrã de abertura**: coloca `public/opening_img.png` ou `public/opening_img.jpg` — mostrada ao carregar e retirada logo a seguir ao primeiro paint da app.
- **Estatísticas**: total, FWC, por seleção com ordenação por %.
- **Ajustes** (sincronização + tema claro/escuro): acede pelo **logo** no cabeçalho (alterna com a coleção); preferência de tema em `localStorage` (`wc2026_theme`).
- **Sincronização**: copiar/colar código entre dispositivos; UI em `Settings` + variante `embedded` na barra de sync.
- **Figurinha 1**: texto dourado quando ainda não tens (só cor; sem destaque extra quando já está “tenho”).
- **PWA**: `manifest.json`; **service worker só em produção** (`import.meta.env.PROD`). O `fetch` do SW **só intercepta pedidos à mesma origem** (evita interferir com imagens externas como bandeiras).

## Requisitos

- Node.js 18+
- [Vercel](https://vercel.com) para deploy
- [Supabase](https://supabase.com) (plano free chega) — projeto Postgres + API

## Base de dados (uma tabela)

No **SQL Editor** do Supabase, executa o ficheiro [`supabase/migrations/001_collections.sql`](supabase/migrations/001_collections.sql) (ou copia o conteúdo). Fica a tabela:

- **`collections`**: `id` (text, PK = código de sync), `payload` (jsonb, mapa `código figurinha` → `true`), `updated_at`.
- **RLS** ligado sem políticas públicas: só a **service role** usada na API serverless escreve/lê (sem utilizador Supabase Auth por agora).

## Variáveis na Vercel

**Settings → Environment Variables** do projeto:

| Variável | Onde copiar |
|----------|-------------|
| `SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Idem → **service_role** (secreto; só servidor) |

**Não** coloques a `service_role` no frontend Vite. A app chama `/api/collection/...` na Vercel, que usa estas variáveis.

Depois de adicionar ou alterar variáveis: **redeploy**. Sem isto a API responde **503** e a app fica em modo local.

Opcional no cliente (`.env.local` na raiz, não commitar):

| Variável | Uso |
|----------|-----|
| `VITE_API_BASE` | Só se a API não for a mesma origem (ex.: `http://127.0.0.1:3000` com Vite + proxy) |

Modelo: [`.env.example`](.env.example).

## Desenvolvimento local

1. Cria o projeto no Supabase e corre o SQL da migração.
2. `.env.local` na raiz com `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`.
3. `npx vercel dev` na raiz (serve `/api` e carrega o `.env.local`).
4. Opcional: noutro terminal `npm run dev` (Vite); o [`vite.config.js`](vite.config.js) faz **proxy** de `/api` para `http://127.0.0.1:3000`.

Se vires **502** ou modo local: o Vite está a proxyar para a porta 3000 mas o `vercel dev` **não está a correr** aí — sobe o `vercel dev` primeiro.

Só `npm run dev`: funciona em modo local (sem nuvem).

## Build e preview

```bash
npm install
npm run build
npm run preview
```

## Deploy (Vercel)

Repositório ligado à Vercel, variáveis `SUPABASE_*` definidas, **redeploy**. Build: `vite build`, saída `dist/`.

### Checklist (produção)

1. **Supabase** — SQL da migração executado; tabela `collections` visível em **Table Editor**.
2. **Vercel** — `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (chave **service_role**, não `anon`).
3. **Redeploy** após guardar as variáveis.
4. **Opcional** — remover variáveis antigas `UPSTASH_REDIS_*` se ainda existirem (o código já não as usa).

Na app, em **Ajustes**, o estado **“Sincronizado na nuvem”** confirma que o GET à API e o Supabase estão OK; **503** ou modo local indicam env em falta ou rede.

## Estrutura

- `api/collection/[syncId].js` — API serverless (Supabase JS + service role)
- `supabase/migrations/001_collections.sql` — schema da tabela `collections`
- `src/hooks/useStickers.js` — estado, debounce PUT, migração `wc2026_owned`
- `src/hooks/useTheme.js` — tema claro/escuro e `theme-color`
- `src/pages/Settings.jsx` — sincronização + aparência
- `src/pages/Collection.jsx` — estado do painel expandido por equipa (linhas de 2 grupos)
- `src/components/SyncBar.jsx` — UI do código (também embutida em Ajustes)
- `src/components/TeamFlag.jsx` / `src/data/flagCodes.js` — URLs de bandeira (flagcdn)
- `src/data/stickers.js` — dados do álbum
- `public/sw.js` — cache PWA (produção; só origem própria no `fetch`)
- `public/opening_img.png` (ou `.jpg`) — imagem opcional do ecrã inicial

## Licença

Uso pessoal do autor do repositório.
