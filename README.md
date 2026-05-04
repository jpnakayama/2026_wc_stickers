# Copa 2026 — Controle de Figurinhas

PWA em React (Vite) para marcar figurinhas do álbum oficial da Copa do Mundo 2026: 48 seleções (20 figurinhas cada) + 20 especiais (FWC), total de **980** figurinhas. Os dados vêm do código; o progresso fica salvo no **localStorage** do navegador.

## Funcionalidades

- **Coleção:** grupos A–L com times colapsáveis; seção FWC (Especiais, Bolas e países, História); toque na figurinha alterna entre *falta* e *tenho*.
- **Estatísticas:** progresso geral, FWC, por grupo e por seleção.
- **PWA:** `manifest.json` e service worker em `public/sw.js` para uso em mobile (adicionar à tela inicial).

## Requisitos

- Node.js 18+ (recomendado)

## Como rodar

```bash
npm install
npm run dev
```

Abra o endereço que o Vite mostrar (geralmente `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

A pasta de saída é `dist/`.

## Deploy (Vercel)

Conecte o repositório ao Vercel; o preset de **Vite** detecta o build automaticamente (`npm run build`, saída `dist`).

## Estrutura principal

- `src/data/stickers.js` — grupos, times e códigos das figurinhas
- `src/hooks/useStickers.js` — estado e persistência
- `src/pages/` — telas Coleção e Estatísticas
- `public/manifest.json` e `public/sw.js` — PWA

## Licença

Uso pessoal do autor do repositório.
