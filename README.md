# suko-jersey-admin

Admin panel za Suko Jersey webshop. Zasebna React aplikacija nad istim Laravel API-jem (`suko-jersey-api`).

**Stack:** Vite · React 19 · TypeScript · TanStack Router (file-based) / Query / Table / Form · Zod · Zustand · axios · Tailwind 4 · shadcn/ui · oxlint

## Pokretanje

```sh
cp .env.example .env   # VITE_API_URL=http://localhost:8000/api
pnpm install
pnpm dev
```

Skripte: `dev`, `build`, `typecheck`, `lint`, `preview`.

## Arhitektura — Feature-Sliced Design

```
src/
  app/       providers, router, rute (app/routes), globalni stilovi
  pages/     kompozicija stranica
  widgets/   veći samostalni UI blokovi
  features/  korisničke akcije (model + ui)
  entities/  poslovni objekti (api/ model/ ui/)
  shared/    api klijent, ui (shadcn), lib (utils, auth), config (env)
```

**Pravilo ovisnosti:** sloj smije importati samo iz slojeva ispod sebe
(`app → pages → widgets → features → entities → shared`). `pnpm lint` to provjerava
(`no-restricted-imports` override po sloju u `.oxlintrc.json`).

### Rute vs. stranice

Fileovi ruta žive u `src/app/routes/` i samo spajaju URL sa stranicom iz `src/pages/`.
`src/app/routeTree.gen.ts` generira Vite plugin — ne uređivati ručno.
Sve rute ispod `_authenticated` traže prijavu (guard u `beforeLoad`).

### Auth

- Token (Sanctum bearer) je u `localStorage` (`suko_admin_token`); store je u `shared/lib/auth`.
- axios interceptor dodaje `Authorization: Bearer …` na svaki zahtjev; na 401 briše token i šalje na `/login`.
- shadcn komponente: `pnpm dlx shadcn@latest add <ime>` — `components.json` ih smješta u `src/shared/ui`
  (nakon dodavanja provjeri da `cn` import pokazuje na `@/shared/lib/utils` i dodaj export u `shared/ui/index.ts`).
