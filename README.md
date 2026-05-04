# Copa 2026 — Controle de Figurinhas

PWA em React (Vite) para o álbum Panini da Copa 2026: **980** figurinhas (48 seleções × 20 + 20 FWC). O estado sincroniza na **nuvem** ([Upstash Redis](https://upstash.com)) via `api/collection/[syncId]` (GET/PUT de JSON). Cada coleção tem um **código de sincronização** (`wc2026_sync_id` no browser). Sem Redis ou sem API ativa, a app usa **modo local** (`localStorage` neste dispositivo).

## Funcionalidades

- Coleção por grupos, bandeiras, toque para marcar figurinha.
- Estatísticas (total, FWC, por seleção com ordenação por %).
- Barra de sincronização: copiar/colar código entre dispositivos.
- PWA: `manifest.json`; **service worker só em produção** (`import.meta.env.PROD`).

## Requisitos

- Node.js 18+
- [Vercel](https://vercel.com) para deploy
- [Upstash Redis](https://upstash.com) (REST) — cria uma base e usa **REST API** no dashboard

## Variáveis na Vercel

**Settings → Environment Variables** do projeto:

| Variável | Onde copiar |
|----------|-------------|
| `UPSTASH_REDIS_REST_URL` | Upstash → Redis → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Idem |

Depois de adicionar ou alterar variáveis: **faz redeploy** (Deployments → … → Redeploy). Sem isto a API pode responder 503 e a app fica em modo local.

Opcional no cliente (`.env.local` na raiz, não commitar):

| Variável | Uso |
|----------|-----|
| `VITE_API_BASE` | Só se a API não for a mesma origem (ex.: `http://127.0.0.1:3000` com Vite + proxy) |

Modelo: [`.env.example`](.env.example).

## Desenvolvimento local

1. `.env.local` na raiz com `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN` (os mesmos valores da Upstash).
2. `npx vercel dev` na raiz (serve `/api` e carrega o `.env.local`).
3. Opcional: noutro terminal `npm run dev` (Vite); o [`vite.config.js`](vite.config.js) faz **proxy** de `/api` para `http://127.0.0.1:3000`.

Se vires **502** ou modo local: o Vite está a proxyar para a porta 3000 mas o `vercel dev` **não está a correr** aí — sobe o `vercel dev` primeiro.

Só `npm run dev`: funciona em modo local (sem nuvem).

## Build e preview

```bash
npm install
npm run build
npm run preview
```

## Deploy (Vercel)

Repositório ligado à Vercel, variáveis `UPSTASH_REDIS_*` definidas, **redeploy**. Build: `vite build`, saída `dist/`.

## Estrutura

- `api/collection/[syncId].js` — API serverless
- `src/hooks/useStickers.js` — estado, debounce PUT, migração `wc2026_owned`
- `src/components/SyncBar.jsx` — UI do código
- `src/data/stickers.js` — dados do álbum
- `public/sw.js` — cache PWA (produção)

## Licença

Uso pessoal do autor do repositório.
