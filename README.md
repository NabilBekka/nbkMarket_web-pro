# NBK Market — Web Pro

Dashboard commerçant de NBK Market. Permet aux commerçants de gérer leur boutique, publier des produits, consulter leurs statistiques et répondre aux messages clients.

## Stack technique

- Next.js 15 (App Router)
- React 19
- TypeScript
- CSS Modules

## Installation

```bash
npm install
```

## Configuration

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend |

## Lancement

```bash
npm run dev
```

Ouvre [http://localhost:3001](http://localhost:3001) dans ton navigateur.

## Structure

```
src/
├── app/              # Pages (App Router)
│   ├── layout.tsx    # Layout racine
│   └── page.tsx      # Dashboard principal
├── components/       # Composants réutilisables
└── styles/
    └── globals.css   # Variables CSS + reset
```

## Design

- Thème : Vert militaire (`#1E2B1E`) + blanc + accent vert lime (`#8BC34A`)
- Sidebar avec navigation complète
- Dashboard avec KPIs (vues, messages, contacts, produits)
- Gestion des produits et contacts
