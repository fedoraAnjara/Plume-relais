# Plume Relais

Application mobile d'**écriture collaborative**. Plusieurs auteurs écrivent une histoire ensemble, un paragraphe à la fois : à chaque tour, les membres proposent une suite, la communauté vote, et la proposition gagnante devient le texte officiel. Le tout peut se jouer **à l'aveugle**, sans voir l'intégralité du récit précédent — à mi-chemin entre le « cadavre exquis » et un réseau social d'écriture.

## Fonctionnalités

- Authentification email / mot de passe
- Profil personnalisable (pseudo, avatar, bio, badges de réputation)
- Création d'histoires avec image de couverture, mode à l'aveugle, visibilité publique ou privée
- Fil à trois catégories : mes histoires, à rejoindre, terminées
- Système de tours : proposition → vote → paragraphe officiel, les autres propositions étant archivées
- Mode à l'aveugle : le récit complet ne se débloque qu'après avoir proposé sa suite
- Temps réel : votes, propositions et compte à rebours du tour mis à jour instantanément
- Notifications in-app (nouveau tour, vote ouvert, histoire terminée) avec cloche et badge
- Réactions, commentaires et partage sur les histoires terminées

## Stack

React Native (Expo SDK 54) · TypeScript · Firebase (Firestore, Auth) · Cloudinary

---

## Guide d'installation complet

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
2. Menu **Authentication** → **Sign-in method** → activez **Email/Password**.
3. Menu **Firestore Database** → **Créer une base de données** (démarrez en mode test).
4. **Paramètres du projet** (roue crantée) → section **Vos applications** → ajoutez une **application Web** (icône `</>`).
5. Firebase affiche un objet de configuration. Gardez ces valeurs, elles serviront à l'étape 5.

### Étape 4 — Créer un compte Cloudinary

Cloudinary héberge les images (avatars et couvertures).

1. Créez un compte gratuit sur https://cloudinary.com
2. Dans le **Dashboard**, notez votre **Cloud Name**.
3. Allez dans **Settings** → **Upload** → **Add upload preset**.
4. Réglez le preset en mode **Unsigned** (important : sans ça, l'upload sera refusé) et notez son nom.

### Étape 5 — Configurer les variables d'environnement

À la racine du projet, créez un fichier nommé `.env` et remplissez-le avec **vos** valeurs (étapes 3 et 4) :

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=votre_cle
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_projet.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=votre_projet
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_projet.appspot.com
EXPO_PUBLIC_FIREBASE_SENDER_ID=votre_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=votre_app_id

# Cloudinary
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```

### Étape 6 — Déployer les règles et index Firestore

Les règles de sécurité (`firestore.rules`) et les index (`firestore.indexes.json`) se déploient avec la CLI Firebase :

```bash
# Installer la CLI (une seule fois)
npm install -g firebase-tools

# Se connecter
firebase login

# Déployer règles et index
firebase deploy --only firestore:rules,firestore:indexes
```

> Si c'est la première fois, lancez `firebase init firestore` et sélectionnez votre projet.

### Étape 7 — Lancer l'application

```bash
npx expo start
```

Un QR code s'affiche dans le terminal. **Scannez-le avec Expo Go** sur votre téléphone. L'application se lance ! 🎉

---

## Récapitulatif installation

| Étape | Ce qu'il faut faire |
|---|---|
| 1 | Installer Node.js, Git et Expo Go |
| 2 | Cloner le projet et `npm install` |
| 3 | Créer un projet Firebase (Auth + Firestore) |
| 4 | Créer un compte Cloudinary (preset unsigned) |
| 5 | Remplir le fichier `.env` |
| 6 | Déployer règles et index Firestore |
| 7 | `npx expo start` et scanner le QR code |

---

## Comment utiliser l'application

### 1. Créer un compte
À la première ouverture, inscrivez-vous avec un email et un mot de passe. Personnalisez ensuite votre profil (pseudo, avatar, bio) depuis l'onglet **Profil**.

### 2. Créer une histoire
Depuis l'onglet **Créer** :
- donnez un **titre** et écrivez le **paragraphe d'ouverture** ;
- ajoutez une **image de couverture** (optionnel) ;
- réglez le **nombre de contributions** et la **durée de chaque tour** ;
- choisissez la **visibilité** (publique ou privée) et activez ou non le **mode à l'aveugle**.

### 3. Rejoindre et contribuer
Dans l'onglet **À rejoindre**, ouvrez une histoire publique et cliquez sur **Rejoindre**, puis proposez votre suite du récit.

> En mode à l'aveugle, vous ne voyez que le paragraphe d'ouverture tant que vous n'avez pas proposé votre propre suite. Une fois votre contribution envoyée, le récit complet se débloque. Les propositions du tour en cours, elles, restent consultables pour permettre le vote.

### 4. Voter
Consultez les propositions en attente et votez pour votre préférée. Vous ne pouvez voter qu'**une seule fois par tour** et pas pour votre propre proposition. Le vote peut être changé tant que le tour est ouvert.

### 5. Clôture du tour
À la fin du temps imparti, la proposition la plus votée devient le **paragraphe officiel** du récit. Son auteur gagne un point de réputation, et un nouveau tour s'ouvre — jusqu'à ce que l'histoire atteigne son nombre de contributions.

### 6. Histoire terminée
Une fois complète, l'histoire se lit d'un bout à l'autre, avec l'auteur de chaque paragraphe. On peut alors y ajouter des **réactions**, des **commentaires** et la **partager**.

### 7. Notifications
Une **cloche** en haut de l'écran signale, en temps réel, l'ouverture d'un vote, le début d'un nouveau tour ou la fin d'une histoire. Un badge indique le nombre de notifications non lues.

---

## Architecture

```
src/
├── app/                    # Écrans (Expo Router)
│   ├── (auth)/             # Connexion / inscription
│   └── (app)/              # Fil, création, profil, notifications, détail
├── components/             # Composants réutilisables
├── contexts/               # Contexte d'authentification
├── hooks/                  # Hooks personnalisés
├── lib/                    # Logique métier et accès Firestore
└── theme/                  # Couleurs et typographies
```

Chaque **histoire** regroupe des sous-collections : `paragraphs` (le récit officiel), `rounds` (les tours, avec `proposals` et un registre `voters`), et `members`. Les votes sont matérialisés par un document unique par utilisateur et par tour, ce qui garantit structurellement « un vote par tour ». Le mode à l'aveugle est appliqué directement au niveau des règles de sécurité Firestore.