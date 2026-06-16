/**
 * Post-traitement de l'export web Expo pour en faire une PWA installable (Netlify).
 * - copie les icônes (web/icons/*) et le manifest dans le dossier publié
 * - injecte les balises <head> PWA (manifest, theme-color, apple-touch, favicons)
 * - corrige le titre et la langue, ajoute un fallback SPA (_redirects)
 *
 * Usage : node scripts/web-pwa.mjs <dossier-export>   (défaut : dist)
 * Idempotent : peut être relancé sans dupliquer les balises.
 */
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoWeb = resolve(here, '../../web'); // dossier web/ à la racine du dépôt
const outDir = resolve(process.cwd(), process.argv[2] || 'dist');

const indexPath = join(outDir, 'index.html');
if (!existsSync(indexPath)) {
  console.error(`✗ index.html introuvable dans ${outDir} — lancez d'abord « expo export --platform web ».`);
  process.exit(1);
}

// 1) Copier icônes + manifest
mkdirSync(join(outDir, 'icons'), { recursive: true });
cpSync(join(repoWeb, 'icons'), join(outDir, 'icons'), { recursive: true });
cpSync(join(repoWeb, 'manifest.webmanifest'), join(outDir, 'manifest.webmanifest'));

// 2) Patcher le <head>
let html = readFileSync(indexPath, 'utf8');
html = html.replace(/<html lang="[^"]*"/, '<html lang="fr"');
html = html.replace(/<title>[\s\S]*?<\/title>/, '<title>Grainor — Semences & Maraîchage</title>');

const HEAD = `
    <meta name="description" content="Gestion des semences pour maraîcher semi-professionnel — hors-ligne." />
    <link rel="manifest" href="/manifest.webmanifest" />
    <meta name="theme-color" content="#33503B" />
    <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16.png" />
    <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="Grainor" />
`;

const MARK = '<!-- grainor-pwa -->';
if (!html.includes(MARK)) {
  html = html.replace('</head>', `  ${MARK}${HEAD}  </head>`);
}
writeFileSync(indexPath, html);

// 3) Fallback SPA pour Netlify (toutes les routes → index.html)
writeFileSync(join(outDir, '_redirects'), '/*    /index.html   200\n');

console.log(`✓ PWA prête dans ${outDir} (manifest + icônes + balises <head> + _redirects).`);
