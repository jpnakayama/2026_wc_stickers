# Copa 2026 — Controle de Figurinhas

PWA em React (Vite) para o álbum Panini da Copa 2026: **980** figurinhas. A coleção guarda-se na **nuvem** ([Supabase](https://supabase.com)): **login por email** (link mágico / OTP, sem Google) e uma linha por utilizador na tabela **`albums`** (`user_id` + `payload` jsonb). O browser usa a chave **anon** + RLS.

## Funcionalidades

- **Login (ecrã inicial sem sessão)**: indicas o email e recebes um **link de acesso** no correio (Supabase `signInWithOtp`). Abres o link para ficar autenticado; não usas palavra-passe na app.
- **Sessão guardada no browser**: após entrar, visitas seguintes no mesmo dispositivo abrem logo a **coleção** até **terminares sessão** (Ajustes) ou limpares dados do site. **Guia anónima** não tem sessão, por isso mostra sempre o login.
- **Coleção / Estatísticas / Ajustes** só com sessão válida; no arranque a app valida o token com o Supabase (`getUser`). Com sessão ativa, o **email** aparece em pequeno no cabeçalho.
- **Coleção**: grelha de grupos; bandeiras (flagcdn); painel de figurinhas por linha de 2 grupos.
- **Ajustes**: conta (email), estado do álbum, recarregar, tema claro/escuro (logo no header).
- **Migração local**: se existir `wc2026_owned` no `localStorage` (dados antigos) e o álbum na nuvem estiver vazio, a primeira carga tenta **enviar** esse mapa para o Supabase.

## Requisitos

- Node.js 18+
- [Vercel](https://vercel.com) para deploy
- [Supabase](https://supabase.com) com Auth + Postgres

## Base de dados

1. **`supabase/migrations/001_collections.sql`** — legado. **Já não é usado**.

2. **`supabase/migrations/002_albums_auth.sql`** — tabela **`albums`** + RLS. **Executa no SQL Editor** do Supabase.

## Variáveis na Vercel

O Vite só expõe variáveis **`VITE_*`** no build:

| Variável | Valor |
|----------|--------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | Chave **anon** `public` |

**Não** uses `SUPABASE_*` sem `VITE_` para o frontend. **Redeploy** após alterar.

Modelo local: [`.env.example`](.env.example) → **`.env.local`**.

## Autenticação por email no Supabase

1. **Authentication → Providers → Email** — ativa (é o que alimenta o link mágico).
2. **Authentication → URL Configuration**  
   - **Site URL**: URL de produção (ex. `https://teu-projeto.vercel.app`).  
   - **Redirect URLs**: inclui `http://localhost:5173` (ou a porta do Vite) para desenvolvimento.
3. (Opcional) **Authentication → Emails** — configura **SMTP** próprio se não quiseres depender dos limites de email do plano free.

O utilizador recebe um email do Supabase com um link; ao abrir, a sessão fica ativa e a app carrega o álbum.

Se na interface aparecer o aviso **«Variáveis `VITE_SUPABASE_*` em falta»**, o build não recebeu URL nem chave anon: corrige **`.env.local`** (dev) ou as env vars na **Vercel** e volta a fazer **build/redeploy**.

## PWA e cache

Em **produção** regista-se um service worker (`public/sw.js`). Se vires comportamento estranho ou JS antigo após um deploy, faz **hard refresh** (Ctrl+Shift+R), ou em DevTools → **Application** → **Service Workers** → **Unregister**, e recarrega. O nome do cache do SW é bumpado quando convém forçar atualização nos clientes.

## Desenvolvimento local

1. SQL `002` executado; Email provider ativo.
2. `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. `npm run dev`.

## Build e preview

```bash
npm install
npm run build
npm run preview
```

## Estrutura

- `src/App.jsx` — fluxo de auth (validação inicial, ecrã de login vs app autenticada)
- `src/lib/supabaseClient.js` — cliente Supabase (anon)
- `src/pages/Login.jsx` — link mágico por email
- `src/hooks/useStickers.js` — `albums` (debounce 500 ms)
- `supabase/migrations/002_albums_auth.sql` — schema + RLS
- `src/data/stickers.js` — dados do álbum
- `public/sw.js` — PWA

## Licença

Uso pessoal do autor do repositório.
