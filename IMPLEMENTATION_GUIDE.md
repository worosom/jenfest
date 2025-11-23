This guide is tailored for a team of senior developers. Given the constraints (\<100 users, short duration, no heavy optimization needed), the focus is on **velocity, simplicity, and "good enough" architecture** rather than scalability or complex abstraction.

We will leverage **Firebase's BAAS features** heavily to avoid writing backend code.

---

### 1\. Tech Stack & Key Libraries

Since optimization isn't a priority, we choose libraries that offer the best Developer Experience (DX) and speed.

- **Core:** React, Tailwind CSS, Firebase (Auth, Firestore, Storage).
- **Map Logic:** `react-leaflet` & `leaflet`.
  - _Why:_ Best support for `CRS.Simple` (Coordinate Reference System), which allows projecting a flat image (x, y) as a map rather than using latitude/longitude.
- **Dates/Calendar:** `date-fns` (lightweight manipulation) + Custom UI.
  - _Note:_ For a 3–5 day festival, a full monthly calendar library (like FullCalendar) is overkill and visually clunky. A simple vertical agenda or horizontal swimlane built with Tailwind is superior.
- **Icons:** `lucide-react` or `heroicons`.
- **Media:** `react-dropzone` for handling uploads.

---

### 2\. Architecture & Data Model (Firestore)

Since the dataset is tiny, we will prioritize **read ease** over write performance. We will use a denormalized structure where useful.

#### Collections

**`users`**

```typescript
{
  uid: string;           // Auth ID
  displayName: string;
  photoURL: string;
  campLocation: {        // Optional, coordinates on the image
    x: number;
    y: number;
  } | null;
  bio: string;
}
```

**`posts`** (Used for both Feed and Activities)

```typescript
{
  id: string;
  authorId: string;
  authorName: string;    // Denormalized for speed (no joins needed)
  authorPhoto: string;   // Denormalized
  content: string;       // Text
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  mapLocation: {         // Optional tag on map
    x: number;
    y: number;
  } | null;

  // Activity specific
  isActivity: boolean;   // If true, shows on calendar
  scheduledAt: Timestamp | null; // Future date

  // RSVP Logic (Array of UIDs is fine for <100 users)
  attendees: string[];

  createdAt: Timestamp;
}
```

---

### 3\. Implementation Breakdown

#### Phase A: The "Imaginary" Map (Leaflet)

This is the core visual component. You cannot use standard tile layers (OpenStreetMap/Google). You must use a **Raster Image** projection.

**Implementation Steps:**

1.  **Image bounds:** Determine the pixel dimensions of the map image provided by Dev.
2.  **CRS.Simple:** Initialize the Leaflet map using the simple coordinate system.
3.  **Bounds Mapping:** Map the image corners to leaflet bounds `[[0,0], [height, width]]`.

<!-- end list -->

```jsx
import { MapContainer, ImageOverlay, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default leaflet marker icons in React
// ... import marker icons ...

const MapComponent = ({ mapImage, onMapClick, markers }) => {
  // Dimensions of your provided image
  const bounds = [[0, 0], [1000, 1000]];

  return (
    <MapContainer
      crs={L.CRS.Simple} // CRITICAL: Disables lat/long logic
      bounds={bounds}
      minZoom={-1}
      center={[500, 500]}
      className="h-full w-full"
    >
      <ImageOverlay url={mapImage} bounds={bounds} />

      {/* Click handler for setting locations */}
      <LocationSelector onClick={onMapClick} />

      {/* Render User Camps & Post Tags */}
      {markers.map(m => <Marker position={[m.x, m.y]} ... />)}
    </MapContainer>
  );
};
```

[Image of Interactive festival map UI wireframe]

#### Phase B: Authentication & Security

**Requirement:** Public Read / Auth Write.

**Firebase Security Rules (Firestore & Storage):**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Anyone can read everything
    match /{document=**} {
      allow read: if true;
    }

    // Only logged in users can create/update
    match /posts/{postId} {
      allow create: if request.auth != null;
      // Allow update if author OR if updating RSVP list
      allow update: if request.auth != null;
    }

    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

_Senior Dev Note:_ Be lenient with the RSVP update rule. Technically, a malicious user _could_ RSVP for someone else via the console, but for a trusted group of \<100, enforcing strict "only add your own ID to the array" logic in security rules is largely unnecessary overhead.\*

#### Phase C: The Feed & Activities

**State Strategy:**
Use a simple `useEffect` listener on the `posts` collection ordered by `createdAt` (descending) for the Feed.

**Activity Logic:**

1.  Filter the `posts` array where `isActivity === true`.
2.  Sort by `scheduledAt` (ascending).
3.  **Calendar View:** Since the festival is 3-5 days, map these into a list grouped by Day (e.g., "Friday", "Saturday").

**RSVP Toggle:**
Since we store attendees as an array of strings `['uid1', 'uid2']`:

- **UI:** `attendees.includes(currentUser.uid)` determines the button state (Join/Leave).
- **Action:** `arrayUnion` or `arrayRemove` in Firestore.

<!-- end list -->

```javascript
const toggleRSVP = async (post) => {
  const ref = doc(db, "posts", post.id);
  if (post.attendees.includes(user.uid)) {
    await updateDoc(ref, { attendees: arrayRemove(user.uid) });
  } else {
    await updateDoc(ref, { attendees: arrayUnion(user.uid) });
  }
};
```

#### Phase D: Profile & Camp Location

1.  **Onboarding:** When a user signs up (Google OAuth), check if a `users` doc exists. If not, prompt them to "Set Camp Location."
2.  **Setting Location:** Open the Map component in "selection mode."
3.  **Saving:** Save the clicked `[x, y]` coordinates to the user profile.
4.  **Visualization:** Render all user avatars on the map at their camp locations.

---

### 4\. Development Roadmap (3 Days)

- **Day 1: Core & Map**

  - Setup Firebase project & deploy generic React app.
  - Implement OAuth.
  - Get the Image Map rendering correctly with `L.CRS.Simple`.
  - Allow users to click the map and console log the x/y coordinates.

- **Day 2: Data Flow**

  - Create the Profile form (save bio/coordinates).
  - Create the "Make a Post" modal (Text + Image Upload + Date Picker).
  - Render the Feed (Read-only).

- **Day 3: Polish & Interaction**

  - Wire up the RSVP buttons.
  - Create the "Schedule" view (filtering posts by date).
  - Add "Map Markers" for posts (e.g., if a post is about a party at a specific location, show it on the map).

---

### 5\. Potential Pitfalls (Senior Watchlist)

1.  **Map Aspect Ratio:** If the image aspect ratio doesn't match the bounds defined in Leaflet, the map will look squashed. Ensure the `bounds` array matches the image's natural aspect ratio.
2.  **Mobile UX:** The map interaction (pinch/zoom) can fight with page scrolling.
    - _Fix:_ Use a fullscreen modal for the map interactions on mobile, or ensure `touchAction: none` is applied correctly within the map container.
3.  **Image sizes:** Even with \<100 users, people upload 10MB photos.
    - _Fix:_ Use a simple HTML canvas resize in the browser before uploading to Firebase Storage to keep loads snappy.

### Next Step

Would you like me to generate the **boilerplate code for the `L.CRS.Simple` Map Component** or the **Firestore Security Rules** to get you started immediately?
