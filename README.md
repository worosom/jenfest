# Jenfest

A festival companion app for when you need to find your friends but cell service is trash.

## What It Does

- **Feed**: Post updates like "anyone seen Dave?" or "party at camp 7B"
- **Map**: Drop a pin where you pitched your tent so people stop asking
- **Schedule**: RSVP to activities you'll probably sleep through
- **Profiles**: Stalk other campers (in a friendly way)

## Tech Stack

React + Firebase + Leaflet for mapping (because festival grounds aren't on Google Maps)

Uses `L.CRS.Simple` to treat your festival map image like an actual map. Yes, this is a thing Leaflet can do.

## Running It

```bash
npm install
npm run dev
```

Then throw a `map.jpg` in `/public` and configure Firebase or nothing will work.

## Architecture Choices

- **Real-time everything**: Firebase listeners everywhere because this is 2025 and polling is for losers
- **Denormalized data**: Author names copied into posts. JOIN operations? Never heard of her
- **Public reads**: Anyone can see everything. It's a festival, not Fort Knox
- **Canvas image resizing**: Client-side compression before upload because your friend Sarah takes 10MB photos
- **No Redux**: Just vibes and React Context

## Notable Features

- Texas ranch color theme (leather browns, sunset oranges) because why not
- Profile pictures auto-resize to 400px so your storage bucket doesn't explode
- Map markers for camps, posts, AND activities (three whole types!)
- RSVP system using Firestore arrays because we have <100 users and premature optimization is the root of all evil

## Security Model

Everyone can read. Only auth'd users can write. That's it. That's the security model.

Don't try to scale this past 100 users or the denormalization demons will find you.

## Development Notes

Built for velocity over perfection. This is a weekend festival app, not Instagram.

If you're looking for microservices, event sourcing, or blockchain integration, you're in the wrong repo.