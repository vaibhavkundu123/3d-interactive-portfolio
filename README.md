# 🏎️ Vaibhav Kundu — 3D Arcade Toy Car & Island Playground

An interactive 3D arcade portfolio website built with **Three.js**, **React 19**, and **Vite**, inspired by classic physical playground portfolios (Bruno Simon style).

![Award Badge](https://img.shields.io/badge/IEEE_SPACE_2026-Best_Paper_Winner-f59e0b?style=for-the-badge)
![DRDO Badge](https://img.shields.io/badge/DRDO_CABS-Research_Trainee-0ea5e9?style=for-the-badge)
![Tech](https://img.shields.io/badge/Three.js-Arcade_Physics-22c55e?style=for-the-badge)

---

## 🎮 Gameplay & Features

- **🚗 Playable Arcade Toy Car**:
  - Front-wheel steering geometry, 4 rotating wheels with tire treads.
  - Spring suspension dynamics (body roll when drifting, pitch when accelerating/braking).
  - Headlights casting real light cones on the road during night drives.
  - Working **Horn** (`H` key or on-screen button) with playful squash-and-stretch bounce.
  - Jump mechanics (`Spacebar`) and stunt ramps!
- **🌅 Dynamic Time-of-Day Lighting**:
  - One-click toggle between **Day** (warm golden sunshine & soft shadows), **Sunset** (vibrant rose-gold twilight), and **Night** (deep starry sky with glowing headlights).
- **🏝️ Low-Poly Island World**:
  - Stylized lush grass island surrounded by animated ocean water.
  - Curving asphalt roadways connecting all 6 pavilions.
  - Low-poly pine trees, boulders, and wooden stunt ramps.
- **✨ 6 Thematic Pavilions**:
  1. **Welcome Plaza (About)**: Gazebo with avatar portrait, bio billboard, and 1-click Resume dispenser.
  2. **Skills Playground**: 3D domino skill blocks (PyTorch, NeMo, TensorFlow, Python, Java, DSA) that wobble when your car knocks into them!
  3. **Research District (Experience)**: Low-poly DRDO radar tower & speech frequency visualizer, Sasken school house, Celebal data lab, Infosys clinic.
  4. **Winner's Podium (Achievements)**: Giant Golden Trophy on a 1st-place victory pedestal celebrating the **IEEE SPACE 2026 Best Paper Award**, with confetti when driving up!
  5. **The Campus (Education)**: University building with clock tower and flags for Netaji Subhas Engineering College (B.Tech CSE, VP GNX) and South Point High School.
  6. **Post & Telecom Station (Contact & Gemini AI)**: Drive-in mail kiosk with Formspree contact form (`mwvnrpog`) and interactive Gemini AI bot.
- **🔊 Web Audio API Procedural Sound Engine**:
  - Car engine throttle, tire skids, horn honks, wooden block collisions, and jump swooshes (zero external audio files).

---

## ⌨️ Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Accelerate** | `W` or `Up Arrow` | Joystick Up |
| **Brake / Reverse** | `S` or `Down Arrow` | Joystick Down |
| **Steer** | `A` / `D` or `Left` / `Right` | Joystick Left / Right |
| **Jump / Stunt** | `Spacebar` | Jump button |
| **Honk Horn** | `H` | `HONK!` button |
| **Inspect Pavilion** | `E` | Tap Pavilion or button |
| **Autopilot Tour** | Click any station in bottom dock | Tap bottom dock |

---

## 🛠️ Tech Stack

- **3D Graphics Engine**: Three.js (WebGL, procedural shadows, spot lights, geometries)
- **Frontend**: React 19, CSS Modules, Glassmorphic Panels
- **Audio Engine**: HTML5 Web Audio API
- **AI & Forms**: Google Gemini API, Formspree

---

## 💻 Local Development

```bash
# Navigate to project
cd My_Portfolio_Website

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 📜 License

Created with ❤️ by [Vaibhav Kundu](https://github.com/vaibhavkundu123).
