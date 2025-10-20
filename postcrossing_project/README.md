
# PostCrossing Mock — Updated to run locally (no Docker required for MongoDB)

This repository is a mock implementation of PostCrossing for the assignment.
I updated the project so you can run the backend directly against a local MongoDB instance (no Docker required).

## Quick local setup (Windows / PowerShell)

1. Install MongoDB Community Server on your machine and start the service (or run `mongod --dbpath "C:\data\db"`).
2. In `server/.env` ensure the following:
```
MONGODB_URI=mongodb://localhost:27017/postcross
JWT_SECRET=change_this_secret
PORT=3000
```
3. From `server` folder install dependencies and start:
```powershell
cd server
npm install
node index.js
```
4. Seed sample users (if not already seeded):
```powershell
node seed.js
```
5. Run the demo PowerShell script to perform login → request → mark-sent → mark-received:
```powershell
.\demo.ps1
```

## Notes about Docker
The original project included a `docker-compose.yml` to run `mongo` in Docker. You don't need Docker — the server connects to the local MongoDB instance via `server/.env`. If you prefer Docker, the compose file is still included, but it is optional.


# PostCrossing Mini-Project

This archive contains a minimal, ready-to-run skeleton for the PostCrossing mini-project:
- Node.js + Express server (Mongoose models) implementing core postcard flows.
- `seed.js` to populate a mock MongoDB database with sample users/profiles.
- A simple Firefox extension (manifest + background service worker) that sorts PostCrossing postcard tabs.
- Postman collection with example requests.

## Quick start (local dev)

1. Install dependencies:
   ```bash
   cd server
   npm install
   ```

2. Run MongoDB (local or use MongoDB Atlas). Set `MONGODB_URI` in `.env` or use default `mongodb://localhost:27017/postcross`.

3. Seed the database:
   ```bash
   node seed.js
   ```

4. Start the server:
   ```bash
   node index.js
   ```

5. Load the Firefox extension:
   - Open `about:debugging#/runtime/this-firefox`
   - Click **Load Temporary Add-on...** and select `extension/manifest.json`.

## Structure

- server/: Express server, Mongoose models, routes, and seed script.
- extension/: Firefox extension files (manifest.json, background.js)

This is a minimal scaffold designed to be extended. See the original project plan for full details.
