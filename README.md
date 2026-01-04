# LearnTrackYT

A production-ready YouTube Playlist Learning Tracker MERN Application.  

## 🚀 Quick Start (Manual Instructions)

The application is installed in `E:\YT TRACK`. Since the folder name has a space, you must use quotes when navigating.

### 1. Start the Backend
Open a new terminal and run:
```powershell
cd "E:\YT TRACK\backend"
npm install
npm start
```
*You should see "MongoDB Connected" and "Server running on port 5000".*

### 2. Start the Frontend
Open a **new** terminal (keep the backend running) and run:
```powershell
cd "E:\YT TRACK\frontend"
npm install
npm run dev
```
*App will start at `http://localhost:5173`.*

## 📱 Features
- **Import Playlist**: Enter `demo-java` in the import box to load sample data immediately.
- **Track Progress**: Click videos to toggle status (Not Started -> Completed).

## ⚠️ Troubleshooting
- **Folder Navigation**: value `cd backend` might fail if you are not in the root. Always check your path.
- **Build Errors**: If `npm run build` fails, stick to `npm run dev` for testing. The development server is fully functional.

## 📱 Android Build (Advanced)
To generate the APK, the production build must succeed.
```powershell
cd "E:\YT TRACK\frontend"
npm run build
npx cap sync
npx cap open android
```
