#  télécharge un système Linux minimal qui contient déjà Node 20.
FROM node:20-alpine

# crée un dossier /app et se place dedans.Le dossier de travai.
WORKDIR /app

# copie les fichiers package.json depuis la machine vers ce /app.
# Astuce : tant que package.json ne change pas, Podman réutilise
# le cache de l'étape suivante et ne réinstalle pas tout à chaque build.
COPY package*.json ./

# exécute npm install, ce qui crée un node_modules à l'intérieur de l'image.
RUN npm install

# Puis on copie le reste du code source.
COPY . .

# Vite écoute sur ce port. (EXPOSE est purement documentaire ici,
# c'est le compose qui fera la vraie liaison de ports.)
EXPOSE 5173

# On lance le serveur de dev. Le "--host 0.0.0.0" est LE point crucial.
# Pour que Vite ecoute sur TOUTES les interfaces et pas seulement a l'interieur du conteneur
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]