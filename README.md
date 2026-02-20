# Classic 404 - Next.js + TypeScript + styled-components

Proyecto en Next.js (App Router) con TypeScript, ES6 y `styled-components`, enfocado en una pagina 404 clasica de internet.

## Stack
- Next.js 16
- React 19
- TypeScript
- styled-components

## Desarrollo local
```bash
npm install
npm run dev
```

## Build estatico
```bash
npm run build
```
Genera la carpeta `out/` para GitHub Pages.

## Deploy gratis en GitHub Pages
Este repo ya incluye workflow en `.github/workflows/deploy-pages.yml`.

1. Crea/sube el repo a GitHub (rama `main`).
2. En GitHub entra a `Settings > Pages`.
3. En `Build and deployment`, selecciona `Source: GitHub Actions`.
4. Haz push a `main`.
5. Espera que termine el workflow `Deploy Next.js to Pages`.

URL final:
`https://<tu-usuario>.github.io/<tu-repo>/`

## Comandos Git rapidos
```bash
git add .
git commit -m "feat: create nextjs typescript styled-components 404 site"
git push origin main
```