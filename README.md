# Copa 2026 — Controle de Figurinhas

PWA em React (Vite) para o álbum Panini da Copa 2026: **980** figurinhas. A coleção guarda-se na **nuvem** ([Supabase](https://supabase.com)): **email e palavra-passe** (`signInWithPassword` / `signUp`) com **Entrar**, **Cadastre-se** e **recuperação de palavra-passe** (`resetPasswordForEmail` + `updateUser`). Uma linha por utilizador na tabela **`albums`** (`user_id` + `payload` jsonb). O browser usa a chave **anon** + RLS.

## Funcionalidades

- **Login (ecrã inicial sem sessão)**: **Entrar** com email + palavra-passe ou **Cadastre-se** no primeiro acesso (mesmos campos). **Esqueci-me da palavra-passe** envia email com link; ao abrir, defines nova palavra-passe na app. Mínimo de 6 caracteres (Supabase).
- **Sessão guardada no browser**: após entrar, visitas seguintes no mesmo dispositivo abrem logo a **coleção** até **terminares sessão** (Ajustes) ou limpares dados do site. **Guia anónima** não tem sessão, por isso mostra sempre o login.
- **Coleção / Estatísticas / Ajustes** só com sessão válida; no arranque a app valida o token com o Supabase (`getUser`). Com sessão ativa, o **email** aparece em pequeno no cabeçalho.
- **Coleção**: grelha de grupos; bandeiras (flagcdn); painel de figurinhas por linha de 2 grupos.
- **Ajustes**: conta (email), estado do álbum, recarregar, tema claro/escuro.
- **Identidade visual**: um único recurso gráfico, [`public/opening_img.png`](public/opening_img.png) (logo Copa 2026): **splash** ao abrir a app (`index.html`), **ecrã de carregamento** enquanto a sessão inicial valida no Supabase, **ícone** no cabeçalho (atalho para Ajustes), **favicon**, **apple-touch-icon** e **ícones** do [`manifest.json`](public/manifest.json). A imagem usa uma animação de **pulso** (escala) na splash e no carregamento.
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

## Autenticação (email + palavra-passe) no Supabase

1. **Authentication → Providers → Email** — ativa e garante que o login por **email + password** está permitido (não só magic link).
2. **Confirm email** — se estiver ativo, após **Cadastre-se** o utilizador tem de abrir o link do email antes de conseguir **Entrar**. Para desenvolvimento podes desativar confirmação temporariamente no mesmo ecrã do provider Email.
3. **Authentication → URL Configuration**  
   - **Site URL**: URL da app em produção (ex. `https://teu-projeto.vercel.app`), **não** deixes `localhost:3000` se a app Vite corre outra porta.  
   - **Redirect URLs**: inclui **exactamente** os URLs usados na app (ex. `http://localhost:5173`, `http://localhost:5173/`, produção). O link do email de **recuperação de palavra-passe** redireciona para estes URLs; se faltarem na lista, o Supabase bloqueia o redirect.
4. (Opcional) **Authentication → Emails** — **SMTP** próprio para emails de confirmação/recuperação fiáveis. Podes personalizar o modelo **Reset password**; o link continua a usar `{{ .ConfirmationURL }}`.

No plano gratuito o Supabase aplica **limites de taxa** a pedidos de auth (registo, magic link, recuperação, etc.). Se aparecer **429** / *email rate limit exceeded*, espera alguns minutos, evita testes repetidos em sequência ou configura **SMTP** / plano pago para limites mais altos.

Após login válido, a sessão fica ativa e a app carrega o álbum.

### Recuperação de palavra-passe (fluxo técnico)

1. No login, **Esqueci-me da palavra-passe** → `resetPasswordForEmail` com `redirectTo` = origem atual da app (`/`).  
2. O utilizador abre o link do email; o cliente Supabase (`detectSessionInUrl`) processa o hash e dispara **`PASSWORD_RECOVERY`**.  
3. **`App.jsx`** mostra `RecoverPassword.jsx` até `auth.updateUser({ password })` ter sucesso; depois passa à app normal. O hash da URL com `type=recovery` também é usado no arranque como reforço se o evento chegar tarde.

Se na interface aparecer o aviso **«Variáveis `VITE_SUPABASE_*` em falta»**, o build não recebeu URL nem chave anon: corrige **`.env.local`** (dev) ou as env vars na **Vercel** e volta a fazer **build/redeploy**.

Na **build de produção** (ex. Vercel), o cartão de login **não** mostra o bloco longo de ajuda ao Supabase — isso só aparece em **`npm run dev`**, num `<details>` colapsável para quem configura o projeto.

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

- `src/App.jsx` — fluxo de auth (validação inicial, login, recuperação de palavra-passe vs app autenticada)
- `src/lib/supabaseClient.js` — cliente Supabase (anon)
- `src/pages/Login.jsx` — entrar / cadastrar / recuperar palavra-passe
- `src/pages/RecoverPassword.jsx` — definir nova palavra-passe após link do email
- `src/hooks/useStickers.js` — `albums` (debounce 500 ms)
- `supabase/migrations/002_albums_auth.sql` — schema + RLS
- `src/data/stickers.js` — dados do álbum
- `public/opening_img.png` — arte oficial / ícones da app
- `public/sw.js` — PWA

## Licença

Uso pessoal do autor do repositório.
