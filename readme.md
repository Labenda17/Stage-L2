# Calculateur de Champs Électromagnétiques

Calculateur interactif pour visualiser les champs électriques et magnétiques basé sur les exercices du TD LSPh411N de l'UVSQ.

## 🚀 Installation et démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### 📁 Structure du projet
```
electromagnetic-calculator/
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   └── index.css
└── README.md
```

### 🛠️ Étapes d'installation

1. **Créer le dossier du projet**
```bash
mkdir electromagnetic-calculator
cd electromagnetic-calculator
```

2. **Créer tous les fichiers**
Copiez le contenu de chaque fichier fourni dans l'arborescence ci-dessus.

3. **Installer les dépendances**
```bash
npm install
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

5. **Ouvrir dans le navigateur**
L'application sera accessible à : `http://localhost:3000`

### 🏗️ Scripts disponibles

- `npm run dev` - Démarrer en mode développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser la version de production

## 🎯 Fonctionnalités

### 📚 Exemples du TD LSPh411N
- **Exemple 1** : Ez → X (1000 V/m)
- **Exemple 2** : Ex → Y (1000 V/m)  
- **Exemple 3** : Ex → Z (1000 V/m)
- **Exemple 4** : Ey → X (1000 V/m)
- **Exemple 5** : Laser He-Ne (868 V/m)
- **Exemple 6** : Champ B donné (3 μT)

### ⚙️ Fonctionnalités avancées
- **Calcul automatique** : E⃗ ↔ B⃗
- **Visualisation 3D** sur canvas
- **Contrôles d'échelle** pour le champ magnétique
- **Créateur d'exemples** personnalisés
- **Sauvegarde** des configurations

### 🎨 Visualisation
- **Zones séparées** : E⃗ (rouge) et B⃗ (bleu)
- **Échelle adaptative** : ×10⁹ à ×10¹² pour B⃗
- **Épaisseur réglable** des flèches
- **Valeurs numériques** affichées en temps réel

## 🔧 Technologies utilisées

- **React 18** - Interface utilisateur
- **Vite** - Build tool moderne
- **Tailwind CSS** - Styling
- **Lucide React** - Icônes
- **Canvas API** - Visualisation 2D

## 📖 Guide d'utilisation

1. **Choisir un exemple** prédéfini (1-6)
2. **Modifier les valeurs** des champs E⃗ ou B⃗
3. **Ajuster la direction** de propagation
4. **Contrôler l'affichage** avec les options avancées
5. **Créer et sauvegarder** vos propres exemples

## 🎓 Base physique

- **Fréquence** : f = 2.5 GHz
- **Relations** : B⃗ = (k⃗ × E⃗)/ω
- **Vitesse** : c = 3×10⁸ m/s
- **Perpendiculaire** : E⃗ ⟂ B⃗ ⟂ k⃗

## 🐛 Dépannage

### Erreur d'installation
```bash
# Nettoyer le cache npm
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port déjà utilisé
```bash
# Modifier le port dans vite.config.js
server: {
  port: 3001,  // Changer le port
  open: true
}
```

### Problème Tailwind
```bash
# Vérifier la configuration PostCSS
npm run build
```

## 📝 Notes importantes

- **Canvas responsive** : Adaptation automatique mobile/desktop
- **Calculs physiques** : Équations de Maxwell respectées
- **Valeurs réalistes** : Correspondance avec les données du TD
- **Performance** : Rendu optimisé 60 FPS

## 🎯 Extensions possibles

- Animation temporelle des ondes
- Export PNG des visualisations
- Mode 3D avec Three.js
- Calcul du vecteur de Poynting
- Polarisation circulaire/elliptique

---
**Développé pour le TD LSPh411N - UVSQ UFR des Sciences**
