# Questionnaire avec Discord Webhook

Application web de questionnaire interactive qui envoie les résultats à un webhook Discord.

## Fonctionnalités

- Interface de questionnaire interactive avec questions à choix multiples
- Suivi des réponses en temps réel
- Calcul automatique du score
- Affichage détaillé des résultats (bonnes/mauvaises réponses)
- Envoi des résultats à un webhook Discord
- Design moderne et responsive

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Lancer le serveur local Node.js :
```bash
npm run dev
```

3. Ouvrir http://localhost:3000. Le panel admin est disponible sur http://localhost:3000/admin/.

## Configuration du Webhook Discord

1. Créer un webhook Discord sur votre serveur :
   - Allez dans les paramètres de votre serveur
   - Intégrations → Webhooks
   - Créer un webhook
   - Copiez l'URL du webhook

2. Collez l'URL du webhook dans le champ prévu à cet effet après avoir complété le questionnaire

## Personnalisation

Pour modifier les questions, éditez le fichier `src/App.jsx` et modifiez le tableau `questions` :

```javascript
const questions = [
  {
    id: 1,
    question: "Votre question ici",
    options: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correctAnswer: "Option 1"
  },
  // Ajoutez autant de questions que vous voulez
]
```

## Déploiement Render

Utiliser les paramètres suivants pour un Web Service Node.js :

- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm start`
- **Environment** : `Node`

Le serveur écoute automatiquement le port fourni par Render via `PORT`.

## Build pour la production

```bash
npm run build
```

Les bundles compilés par esbuild et les fichiers statiques sont générés dans `dist`.
