# Quick Start Guide

## 1. Firebase Setup (5 minutes)

### Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Name it "Jenfest" (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Click on "Google" provider
4. Toggle "Enable"
5. Select a support email
6. Click "Save"

### Create Firestore Database
1. Go to **Build > Firestore Database**
2. Click "Create database"
3. Select "Start in production mode"
4. Choose a location closest to your users
5. Click "Enable"

### Set Firestore Rules
1. In Firestore Database, click "Rules" tab
2. Replace with:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read: if true;
    }
    match /posts/{postId} {
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
3. Click "Publish"

### Create Storage
1. Go to **Build > Storage**
2. Click "Get started"
3. Select "Start in production mode"
4. Choose same location as Firestore
5. Click "Done"

### Set Storage Rules
1. In Storage, click "Rules" tab
2. Replace with:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```
3. Click "Publish"

### Get Firebase Config
1. Click gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click web icon (</>) to add a web app
5. Register app with nickname "Jenfest Web"
6. Copy the firebaseConfig object

## 2. Local Setup

### Install Dependencies
```bash
npm install
```

### Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and paste your Firebase config values:
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Run Development Server
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## 3. Add Festival Map

Replace placeholder map URLs in:
- `src/pages/MapView.jsx` (line 11)
- `src/pages/Profile.jsx` (line 95)

```javascript
const mapImage = '/path/to/your/festival-map.jpg';
```

Update dimensions if needed:
```javascript
<MapComponent
  mapImage={mapImage}
  imageWidth={1500}  // your map width in pixels
  imageHeight={1000} // your map height in pixels
  ...
/>
```

## Testing

1. Sign in with Google
2. Go to Profile tab
3. Set your camp location by clicking the map
4. Save profile
5. Go to Map tab to see your marker

## Next Steps

See full README.md for:
- Creating posts with media
- Scheduling activities
- RSVP functionality
- Additional features
