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

2. Lancer le serveur de développement :
```bash
npm run dev
```

3. Ouvrir le navigateur à l'URL affichée (généralement http://localhost:5173)

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

## Build pour la production

```bash
npm run build
```

Les fichiers build seront dans le dossier `dist`.
