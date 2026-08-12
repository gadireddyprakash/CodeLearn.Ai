# Mobile App Deployment & QA Testing Guide (Cable-Free)

This guide explains how the deployment or QA team can run the **CodeLearn Mobile App (APK)** on physical mobile devices **completely wireless (without a USB cable)**, while still storing all data in the MongoDB database.

---

## Method 1: Local Wi-Fi Connection (Easiest for office/local QA)
Use this if the mobile device and the computer running the backend server can connect to the **same Wi-Fi network**.

### 1. Update the API IP Address
1. Find your computer's Wi-Fi IP address:
   * Open Command Prompt and type `ipconfig`
   * Find the **Wireless LAN adapter Wi-Fi** IPv4 address (e.g. `10.218.170.41`).
2. Open `project/.env` and set `VITE_API_URL` to point to your computer's Wi-Fi IP:
   ```env
   VITE_API_URL=http://10.218.170.41:5000/api
   ```

### 2. Build and Sync the App
Run these commands in the `project/` directory:
```bash
# 1. Compile the web assets with the new IP address
npm run build

# 2. Sync web assets to the Android project folder
npx cap sync
```

### 3. Install and Test (Wireless)
1. Open Android Studio: `npx cap open android`.
2. Connect your phone via USB **only to install the app** (click the Run button in Android Studio).
3. **Unplug the USB cable.**
4. As long as your phone is on the same Wi-Fi network, the app will run wirelessly and store all data inside the PC's MongoDB database.

---

## Method 2: Public secure tunnel (For remote QA / off-site testing)
Use this if the phone and laptop are on **different networks** (e.g., phone is on mobile data/LTE, and laptop is on a protected office Wi-Fi).

### 1. Open a Public Tunnel
Open a terminal on your PC and run:
```bash
ssh -o StrictHostKeyChecking=no -R 80:127.0.0.1:5000 nokey@localhost.run
```
Copy the secure HTTPS URL generated in the terminal (e.g., `https://0291eb209a6d7d.lhr.life`).

### 2. Configure and Build the App
1. Open `project/.env` and paste the generated HTTPS URL:
   ```env
   VITE_API_URL=https://0291eb209a6d7d.lhr.life/api
   ```
2. Build and sync the app:
   ```bash
   npm run build
   npx cap sync
   ```

### 3. Deploy the Standalone APK
1. Build the release APK in Android Studio (`Build > Build Bundle(s) / APK(s) > Build APK(s)`).
2. Distribute the APK to your deployment or QA team.
3. They can install the APK on **any mobile device anywhere in the world** without cables or local Wi-Fi. Every action will be recorded in your local laptop's MongoDB database through the secure tunnel.

---

## Method 3: Production Deployment (For final release)
For production or client staging releases, the local backend and MongoDB should be hosted on a cloud provider.

1. Deploy the Express backend to a cloud host (Render, Railway, AWS).
2. Host the MongoDB database on **MongoDB Atlas** (Cloud).
3. Update `VITE_API_URL` in `project/.env` to point to the live production server URL (e.g., `https://api.codelearn.com/api`).
4. Build the production APK and distribute it.
