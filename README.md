# Copa 2026 — Controle de Figurinhas

PWA em React (Vite) para o álbum Panini da Copa 2026: **980** figurinhas. A coleção guarda-se na **nuvem** ([Supabase](https://supabase.com)): **Supabase Auth** (hoje: **Google OAuth**) e uma linha por utilizador na tabela **`albums`** (`user_id` + `payload` jsonb). O browser usa a chave **anon** + RLS.

## Funcionalidades

- **Login** com **OAuth Google** (Supabase Auth) — podes trocar para email / magic link alterando o provider no Supabase e o código em `Login.jsx`.
- **Coleção / Estatísticas / Ajustes** só após sessão iniciada; **terminar sessão** em Ajustes.
- **Coleção**: grelha de grupos; bandeiras (flagcdn); painel de figurinhas por linha de 2 grupos.
- **Ajustes**: conta (email), estado do álbum, recarregar, tema claro/escuro (logo no header).
- **Migração local**: se existir `wc2026_owned` no `localStorage` (dados antigos) e o álbum na nuvem estiver vazio, a primeira carga tenta **enviar** esse mapa para o Supabase.

## Requisitos

- Node.js 18+
- [Vercel](https://vercel.com) para deploy
- [Supabase](https://supabase.com) com Auth + Postgres

## Base de dados

1. **`supabase/migrations/001_collections.sql`** — legado (código de sync + API serverless). **Já não é usado** pela app atual.

2. **`supabase/migrations/002_albums_auth.sql`** — tabela **`albums`** com RLS (`select` / `insert` / `update` só para `authenticated` e `auth.uid() = user_id`). **Executa este SQL** no SQL Editor do Supabase (depois de ativares o provider de login que usares).

## Variáveis na Vercel (importante)

O Vite **só expõe** variáveis com prefixo **`VITE_`** ao código do browser, no momento do **`vite build`**.

| Obrigatório na Vercel | Valor |
|----------------------|--------|
| `VITE_SUPABASE_URL` | Project URL do Supabase |
| `VITE_SUPABASE_ANON_KEY` | Chave **anon** `public` (Settings → API) |

**Não basta** ter só `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` (modelo antigo da API serverless): o **frontend não lê** esses nomes. Sem `VITE_SUPABASE_*`, o login mostra aviso de configuração em falta.

A **`service_role`** não deve ir em variáveis `VITE_*` (seria embutida no JS público). Para esta app atual **não** é necessária na Vercel para o álbum; podes removê-la se não tiveres outro uso.

Marca as variáveis para **Production** e **Preview** (e **Development** se usares). Depois de alterar: **Redeploy**.

Modelo local: [`.env.example`](.env.example) → **`.env.local`** na raiz (não commitar).

## Google OAuth no Supabase

1. **Google Cloud Console** → Credenciais → OAuth **Aplicação Web**.
2. **Redirect URI**: `https://<PROJECT_REF>.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → Providers → Google** → ID + Secret.
4. **Authentication → URL Configuration**: **Site URL** = URL de produção; **Redirect URLs** inclui `http://localhost:5173` (dev).

## Desenvolvimento local

1. SQL `002_albums_auth.sql` executado; provider de login ativo no Supabase.
2. `.env.local` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. `npm run dev`.

## Build e preview

```bash
npm install
npm run build
npm run preview
```

## Estrutura

- `src/lib/supabaseClient.js` — cliente Supabase (anon)
- `src/pages/Login.jsx` — OAuth Google
- `src/hooks/useStickers.js` — `albums` (debounce 500 ms)
- `supabase/migrations/002_albums_auth.sql` — schema + RLS
- `src/data/stickers.js` — dados do álbum
- `public/sw.js` — PWA (produção; só mesma origem no `fetch`)

## Licença

Uso pessoal do autor do repositório.
