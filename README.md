# Plume Relais

Application mobile d'**écriture collaborative**. Plusieurs auteurs écrivent une histoire ensemble, un paragraphe à la fois : à chaque tour, les membres proposent une suite, la communauté vote, et la proposition gagnante devient le texte officiel. Le tout peut se jouer **à l'aveugle**, sans voir l'intégralité du récit précédent.

## Fonctionnalités

- Authentification email / mot de passe
- Profil personnalisable (pseudo, avatar, bio, badges)
- Création d'histoires avec image de couverture, mode à l'aveugle, visibilité publique ou privée
- Fil à trois catégories : mes histoires, à rejoindre, terminées
- Système de tours : proposition → vote → paragraphe officiel
- Temps réel (votes et propositions mis à jour instantanément)
- Réactions, commentaires et partage sur les histoires terminées

## Stack

React Native (Expo SDK 54) · TypeScript · Firebase (Firestore, Auth) · Cloudinary

---

## 🚀 Guide d'installation complet

Ce guide part de zéro. Suivez les étapes dans l'ordre.

### Étape 1 — Installer les outils de base

Avant tout, installez sur votre ordinateur :

1. **Node.js** (version LTS) → https://nodejs.org
   Vérifiez l'installation dans un terminal :
   ```bash
   node --version
   npm --version
   ```

2. **Git** → https://git-scm.com

3. Sur votre **téléphone**, installez l'application **Expo Go** depuis le Play Store (Android) ou l'App Store (iOS).

### Étape 2 — Récupérer le projet

```bash
git clone https://github.com/fedoraAnjara/Plume-relais.git
cd Plume-relais
npm install
```

`npm install` télécharge toutes les dépendances (cela peut prendre quelques minutes).

### Étape 3 — Créer un projet Firebase

L'application a besoin d'une base de données et d'un système d'authentification.

1. Allez sur https://console.firebase.google.com et créez un **nouveau projet**.
2. Dans le menu **Authentication** → **Sign-in method** → activez **Email/Password**.
3. Dans le menu **Firestore Database** → **Créer une base de données** (démarrez en mode test).
4. Dans **Paramètres du projet** (roue crantée) → section **Vos applications** → ajoutez une **application Web** (icône `</>`).
5. Firebase vous affiche un objet de configuration. Gardez ces valeurs, elles serviront à l'étape 5.

### Étape 4 — Créer un compte Cloudinary

Cloudinary héberge les images (avatars et couvertures).

1. Créez un compte gratuit sur https://cloudinary.com
2. Dans le **Dashboard**, notez votre **Cloud Name**.
3. Allez dans **Settings** → **Upload** → **Add upload preset**.
4. Réglez le preset en mode **Unsigned** (important : sans ça, l'upload sera refusé) et notez son nom.

### Étape 5 — Configurer les variables d'environnement

À la racine du projet, créez un fichier nommé `.env` et remplissez-le avec **vos** valeurs (celles des étapes 3 et 4) :

```env
# Firebase (étape 3)
EXPO_PUBLIC_FIREBASE_API_KEY=votre_cle
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
EXPO_PUBLIC_FIREBASE_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Cloudinary (étape 4)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```

### Étape 6 — Déployer les règles de sécurité Firestore

Les règles de sécurité (fichier `firestore.rules`) protègent la base de données. Déployez-les avec la CLI Firebase :

```bash
# Installer la CLI (une seule fois)
npm install -g firebase-tools

# Se connecter à votre compte Firebase
firebase login

# Déployer les règles
firebase deploy --only firestore:rules
```

> Si c'est la première fois, lancez `firebase init firestore` et sélectionnez votre projet.

### Étape 7 — Lancer l'application

```bash
npx expo start
```

Un QR code s'affiche dans le terminal. **Scannez-le avec Expo Go** sur votre téléphone. L'application se lance !

---

## Récapitulatif

| Étape | Ce qu'il faut faire |
|---|---|
| 1 | Installer Node.js, Git et Expo Go |
| 2 | Cloner le projet et `npm install` |
| 3 | Créer un projet Firebase (Auth + Firestore) |
| 4 | Créer un compte Cloudinary (preset unsigned) |
| 5 | Remplir le fichier `.env` |
| 6 | Déployer les règles Firestore |
| 7 | `npx expo start` et scanner le QR code |