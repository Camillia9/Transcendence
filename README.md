# Transcendence

**Initialisations des fichiers**

1. Création du projet avec Vite
```
npm create vite@latest Transcendence -- --template react
```
Vite a généré un projet React de base avec tous les fichiers nécessaires pour démarrer.

2. Ajout de Tailwind CSS
On a installé Tailwind et branché son plugin Vite dans vite.config.js. Ça permet d'utiliser des classes comme text-white, bg-gray-900, flex, px-6 directement dans le JSX sans écrire une seule ligne de CSS manuellement.
Le @import "tailwindcss" dans index.css charge tout le système de classes.

3. Ajout de React Router
```
npm install react-router-dom
```
Ça permet de naviguer entre pages sans recharger le navigateur (comme une vraie app). Sans ça, chaque clic sur un lien ferait un rechargement complet.

4. Structure des fichiers créés

App.jsx — le chef d'orchestre : il définit quelle page afficher selon l'URL (/ → Home, /about → About)
layouts/MainLayout.jsx — le squelette commun à toutes les pages (la navbar). Le <Outlet /> est un "trou" où s'insère la page courante
pages/Home.jsx et pages/About.jsx — les deux pages pour l'instant

**Page Login/Signup**

