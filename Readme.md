# CollaboRARE client

Angular 22 front end of CollaboRARE (collaborative lists of what matters to patients with rare diseases, an EMA / EURORDIS
pilot, www.collaborare.app). It talks to
[collaborare_server](https://github.com/foundation29org/collaborare_server), which also serves the build.

## Requirements

- Node `^22.22.3` or `^24.15` (the project is pinned to 24.18.0 with Volta).
- `npm install` uses `legacy-peer-deps` (see `.npmrc`): `ngx-toastr` still declares Angular 21 as its peer.

## Environments

The `src/environments/environment*.ts` files hold keys, so they are not in Git. Copy each `*.sample`
to the same name without `.sample` and fill it in:

| File | Used by |
|------|---------|
| `environment.ts` | `npm start`, `npm run build` (configuration `local`) |
| `environment.dev.ts` | `npm run buildDev` |
| `environment.staging.ts` | `npm run buildStaging` |
| `environment.prod.ts` | `npm run buildProd` |

`api` is the base URL of collaborare_server; `Server_Key` is sent as the `x-api-key` header;
`INSTRUMENTATION_KEY` is the Application Insights key.

## Commands

| Command | What it does |
|---------|--------------|
| `npm start` | Dev server on http://localhost:4200 with the `local` environment |
| `npm test` | Unit tests (Vitest + jsdom): `npm test -- --watch=false` for a single run |
| `npm run buildProd` | Optimised build into `dist/` |

## Deployment

The build output is `dist/` with `index.html`, hashed bundles and `assets/` at its root. Copy that folder to `dist/`
in collaborare_server (`express.static` + fallback to `dist/index.html`, see `app.js`) and deploy the server.

## Pages

- Public (navbar): `/.` (home), `/conditions`, `/aboutus`, `/behind`, `/how-it-works`.
- Login, privacy policy, error and share: `/login`, `/privacy-policy`, `/error`, `/share`. The sign-in link that is
  e-mailed to the user opens `/login?email=...&key=...`.
- Signed-in area: `/mycondition` (edit the list of aspects of a condition) and `/profile` (validator organisation).
  Anonymous visitors are sent to the home page.

## Notes

- Browsers: current Edge, Chrome, Firefox and Safari. Internet Explorer and the legacy Edge do not run module scripts;
  `index.html` shows them a "Browser not supported" message. The old Angular 14 build did not support them either.
- The components keep `ChangeDetectionStrategy.Eager` and zone.js: Angular 22 makes `OnPush` the default and the
  pages mutate plain fields after HTTP and SweetAlert callbacks.
- The theme (`src/assets/sass`) is the Apex theme of the old build; the classes of `<body>` that its layout service
  used to set at runtime are now set by the two layout components (`vertical-layout menu-hide navbar-sticky`, plus
  `auth-page blank-page` on the content layout).
- Angular Material uses the `azure-blue` prebuilt theme with the brand blue `#074576` for the primary colour
  (`html { --mat-sys-primary: ... }` at the end of `src/styles.css`).
- ng-bootstrap 21 needs two small CSS fixes for Bootstrap 4 (modal stacking and `.visually-hidden`), also in
  `src/styles.css`.
