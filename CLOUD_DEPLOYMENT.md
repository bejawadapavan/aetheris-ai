# Deploying Aetheris AI for Mobiles (24/7 Cloud Deployment - No PC Required)

Follow this quick guide to deploy Aetheris AI so it runs 24/7 in the cloud and can be accessed or installed on any mobile phone, even when your PC is turned off.

---

## Step 1: Push Code to GitHub

1. Create a new GitHub repository at [github.com/new](https://github.com/new) named `aetheris-ai` (choose Public or Private).
2. In your terminal, run:
   ```bash
   cd "d:\chrome download\genai-chatbot\genai-chatbot"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/aetheris-ai.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: 24/7 Free Cloud Database (MongoDB Atlas)

1. Go to [mongodb.com/atlas](https://www.mongodb.com/atlas) and create a free account.
2. Create a free **M0 Cluster** (free forever).
3. Under **Database Access**, create a user (e.g. `aetheris_user` with a secure password).
4. Under **Network Access**, click **Add IP Address** and select **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Connect > Drivers > Node.js**, and copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/aetheris_db?retryWrites=true&w=majority
   ```

---

## Step 3: 24/7 Free Backend Server (Render.com)

1. Go to [render.com](https://render.com) and create a free account.
2. Click **New + > Web Service** and select your GitHub `aetheris-ai` repository.
3. Configure the service:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`
4. Under **Environment Variables**, add:
   - `MONGODB_URI` = *(your MongoDB Atlas URI from Step 2)*
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
5. Click **Create Web Service**. Once deployed, copy your backend URL (e.g., `https://aetheris-backend.onrender.com`).

---

## Step 4: 24/7 Free Frontend & Mobile PWA (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New > Project**, and select your `aetheris-ai` repository.
3. Set the **Root Directory** to `client`.
4. Under **Environment Variables**, add:
   - `VITE_API_URL` = `https://aetheris-backend.onrender.com/api` *(your Render URL)*
5. Click **Deploy**. Within 60 seconds, Vercel gives you your production HTTPS link:
   ```
   https://aetheris-ai.vercel.app
   ```

---

## Step 5: Install on Mobile (iOS & Android)

1. Open `https://aetheris-ai.vercel.app` on your mobile phone browser.
2. **On iPhone (Safari)**:
   - Tap the **Share** button (box with arrow up) at the bottom.
   - Tap **"Add to Home Screen"**.
3. **On Android (Chrome)**:
   - Tap the three dots menu in the top right.
   - Tap **"Install app"** or **"Add to Home Screen"**.
4. The **Aetheris AI** app icon will now appear on your phone's home screen and launch in full-screen standalone mobile mode 24/7, without requiring your PC!
