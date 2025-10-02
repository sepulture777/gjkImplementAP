# 🚀 Quick Start Guide

## Start the Application (3 easy steps!)

### 1️⃣ Open Terminal
```bash
cd /Users/tunkeltesch/Desktop/APRG_PROJECT/gjkImplementAP/convex_hull
```

### 2️⃣ Run the Start Script
```bash
./run.sh
```

This will:
- ✅ Install Python dependencies (if needed)
- ✅ Install Node dependencies (if needed)
- ✅ Start backend on http://localhost:8000
- ✅ Start frontend on http://localhost:5173

### 3️⃣ Open Your Browser
Navigate to: **http://localhost:5173**

---

## 🎮 How to Use

### Step 1: Add Points
- Click "Generate Random" to create random points
- OR click on the canvas to add points manually

### Step 2: Run Algorithm
- Make sure you have at least 3 points
- Click "Run Algorithm" button

### Step 3: Watch the Magic! ✨
- Click "Play" to watch automatic playback
- OR use "Prev"/"Next" to step through manually
- Adjust speed slider for faster/slower playback

---

## 📖 Understanding the Visualization

### Colors
- 🔵 **Gray dots** = All your input points
- 🟢 **Green dots** = Points on the current hull
- 🟡 **Yellow dots** = Active points being processed
- 🔴 **Red line** = Hull being built
- 🟢 **Green polygon** = Complete hull!

### Controls
- **⏮ Prev**: Go to previous step
- **▶ Play**: Start automatic playback
- **⏸ Pause**: Stop playback
- **⏭ Next**: Go to next step
- **🔄 Reset**: Go back to first step
- **Speed Slider**: Adjust playback speed (0.5x to 3x)

---

## 🛑 How to Stop

Press `Ctrl+C` in the terminal where you ran `./run.sh`

This will stop both the backend and frontend servers.

---

## ❓ Troubleshooting

### "Port already in use"
Kill processes on ports 8000 and 5173:
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

### Dependencies not installing
```bash
# Python dependencies
pip install -r requirements.txt

# Node dependencies
cd frontend && npm install
```

### Can't connect to backend
Make sure backend is running on http://localhost:8000
Check terminal output for errors.

---

## 📚 Learn More

- See **README.md** for detailed documentation
- See **IMPLEMENTATION_SUMMARY.md** for technical details
- API docs at: http://localhost:8000/docs (when backend running)

---

**Enjoy exploring convex hull algorithms!** 🎉

