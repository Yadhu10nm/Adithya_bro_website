# 💖 Romantic Proposal Website with 3D Cat Companion

A romantic proposal website built with **React**, **Vite**, and **Three.js**. Features an interactive 3D cat that holds props and reacts to every question and answer, sweet animations, romantic background music, configurable question flows, and an automated WhatsApp celebration redirect.

---

## ✨ Features

- 🖤 **Glowing Romantic Black Screen Intro**:
  - Starts with a starry black screen featuring glowing pink neon typography:
    - **“hey aparna!”**
    - **“i need to ask you something shuttuuuuuuuuu! 💕”**
  - Smooth 5-second countdown with an animated pink glow progress bar, or tap anywhere to enter immediately.
  - Smoothly reveals the questions stage while seamlessly starting the romantic background music.
- 🐱 **Interactive 3D Cat Companion (Three.js)**:
  - Stylized chibi 3D cat with expressive blinking eyes, heart pupils, blushing cheeks, wagging tail, and responsive head tracking.
  - Dynamically switches 3D props based on the current question and visitor's answer:
    - 💌 *Love Letter / Envelope* with heart wax seal
    - ☕ *Cozy Mug* with latte art heart
    - ⭐ *Magic Star Wand* with sparkles
    - 🎈 *Heart Balloon* bobbing on a paw string
    - 🌹 *Rose Bouquet* with clustered velvet petals
    - 💍 *Crimson Velvet Ring Box* with a glittering diamond ring
    - 👑 *Royal Crown & Golden Sparkles* for celebration
    - 💔 *Broken Heart & Drooping Ears* for the respectful No screen
- 🎨 **Romantic Pink & Blue Palette**:
  - High-contrast typography exceeding WCAG standards for optimal readability on mobile and desktop.
  - Playful, affectionate glassmorphic cards and floating ambient gradients.
  - Respects `prefers-reduced-motion` settings.
- 📋 **Configurable Questions Flow via JSON**:
  - Add, remove, or modify any number of questions and options in `src/config/proposalConfig.json` (also mirrored at `public/config.json`).
  - Configure individual cat props, poses, expressions, and immediate reaction messages for every choice.
- 💍 **The Big Proposal Screen**:
  - Displays **“Will you be my wife?”** with **Yes** and **No** buttons.
- 🎉 **Joyful Celebration (Yes Response)**:
  - Confetti bursts and falling love & joy emojis (`💖`, `🥰`, `✨`, `💍`, `🌸`, `🎉`, etc.).
  - 5-second countdown timer with progress bar.
  - Automatically opens WhatsApp to the configured phone number with the URL-encoded message **“I love you”**.
  - Direct fallback button ensures WhatsApp can always be launched even if browser popup blockers are active.
  - Celebration remains visible while the 5-second delay runs.
- 🕊️ **Respectful Response (No Response)**:
  - Immediately stops and resets background music.
  - Rains gentle sad emojis (`🌧️`, `💔`, `🥺`, `💧`).
  - Cat's ears droop with a tear droplet.
  - Displays a modal popup with the exact message:
    > *“Sorry, I was genuine with you, but it’s okay. We can be good friends like before. Be happy.”*
  - Includes a button to restart the journey if clicked by accident.
- 🎵 **Romantic Background Music Player**:
  - Built-in audio file located at `public/audio/romantic-song.mp3`.
  - Visible floating player with Play/Pause, Volume slider, Mute toggle, and animated soundwave equalizer.
  - Gracefully handles browser autoplay policies by starting on the visitor's first tap/click/key interaction anywhere on the page, with a gentle reminder banner if blocked.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### 2. Installation
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be output to the `dist/` directory.

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🛠️ Customizing the JSON Configuration

All editable text, questions, WhatsApp details, cat props, and music settings are located in:
👉 `src/config/proposalConfig.json` *(and `public/config.json`)*.

### JSON Structure Overview

```jsonc
{
  "theme": {
    "title": "A Special Story For You",
    "partnerName": "My Love",
    "senderName": "Adithya",
    "primaryPink": "#E11D48",
    "primaryBlue": "#2563EB",
    // ...
  },
  "music": {
    "filePath": "/audio/romantic-song.mp3",
    "title": "A Thousand Melodies (Romantic Music Box)",
    "artist": "Special Love Story",
    "defaultVolume": 0.65,
    "autoplayOnFirstClick": true
  },
  "questions": [
    {
      "id": "q1",
      "stepBadge": "Chapter 1",
      "question": "Do you remember the moment our story first began?",
      "subtitle": "Thinking back to that day...",
      "catProp": "envelope",          // Prop shown initially
      "catExpression": "curious",     // Expression: happy, blushing, curious, excited, loving
      "options": [
        {
          "id": "q1_opt1",
          "text": "Yes! Like it was yesterday 💕",
          "reactionMessage": "You remember! My heart just fluttered with joy 🥹",
          "nextProp": "envelope",
          "nextExpression": "blushing"
        }
      ]
    }
  ],
  "proposal": {
    "stepBadge": "The Big Question 💍",
    "title": "Adithya has one very special question for you...",
    "mainQuestion": "Will you be my wife?",
    "subtitle": "Will you take my hand and walk through this beautiful adventure together?",
    "catProp": "ring_box",
    "catExpression": "proposal_love",
    "yesButtonText": "Yes, a thousand times yes! 💍💖",
    "noButtonText": "No, I'm sorry 💔"
  },
  "yesResponse": {
    "headline": "She Said YES! 🎉💍❤️",
    "subheading": "You just made me the happiest person alive! Forever begins today.",
    "catProp": "celebration",
    "catExpression": "celebrating",
    "celebrationDelaySeconds": 5,
    "whatsAppNumber": "918301817182",       // Adithya's WhatsApp number (+91 83018 17182)
    "whatsAppMessage": "I love you"          // URL-encoded automatically!
  },
  "noResponse": {
    "popupMessage": "Sorry, I was genuine with you, but it’s okay. We can be good friends like before. Be happy.",
    "catProp": "broken_heart",
    "catExpression": "sad"
  }
}
```

### Adding / Removing Questions
To add a question, add a new object to the `questions` array. To remove one, simply delete that object from the array. The website automatically adapts the step count and progress indicator!

### Available 3D Cat Props:
- `"envelope"`: Pink love letter with wax seal
- `"coffee_cup"`: Ceramic mug with heart latte art
- `"star_wand"`: Glowing golden wand with magical star
- `"heart_balloon"`: Floating glossy heart balloon
- `"rose_bouquet"`: Cluster of red & pink roses with leaves
- `"ring_box"`: Open red velvet box with sparkling diamond ring
- `"celebration"`: Royal golden crown & festive heart
- `"broken_heart"`: Fractured heart
- `"none"`: No prop held

### Available 3D Cat Expressions:
- `"happy"`: Sweet squinting eyes (`^ ^`)
- `"blushing"`: Sweet smile with pink cheek blush
- `"curious"`: Wide open eyes with tilted head and ear flick
- `"excited"`: Open bright eyes
- `"loving"` / `"proposal_love"`: Heart-shaped eyes (`♥ ♥`)
- `"celebrating"`: Pure joyful smile
- `"sad"`: Drooping ears with tear droplet

---

## 🎶 How to Replace the Background Music

1. Place your desired romantic audio file (MP3, WAV, or AAC format) into the `public/audio/` directory:
   ```
   public/
     audio/
       romantic-song.mp3   <-- Replace or add your file here
   ```
2. If your file has a different name, open `src/config/proposalConfig.json` (and `public/config.json`) and update the `filePath`:
   ```json
   "music": {
     "filePath": "/audio/my-favorite-song.mp3",
     "title": "Our Song",
     "artist": "Special Artist"
   }
   ```
3. Modern web browsers prohibit audio autoplay without user gesture. The player is designed to **automatically start playing seamlessly on the visitor's first tap, click, or keyboard interaction anywhere on the screen**, providing a frictionless romantic experience.

---

## 💾 Automatic Answer Storage (`./answer/answer.json`)

Whenever Aparna answers a question or makes the final proposal decision (Yes/No), her responses are **automatically captured and saved into `./answer/answer.json` in the project directory** (as well as mirrored to `public/answer/answer.json` and browser `localStorage`).

### JSON File Format (`./answer/answer.json`)
```json
{
  "lastUpdated": "2026-10-17T23:25:00.000Z",
  "partnerName": "Aparna",
  "senderName": "Adithya",
  "proposalDecision": "yes",
  "totalAnswered": 5,
  "responses": [
    {
      "questionId": "q1",
      "question": "Aparna, do you remember the moment our story first began?",
      "answerId": "q1_opt1",
      "answer": "Yes! Like it was yesterday 💕",
      "timestamp": "2026-10-17T23:24:10.000Z"
    },
    {
      "questionId": "final_proposal",
      "question": "Will you be my wife?",
      "answerId": "yes",
      "answer": "Yes, a thousand times yes! 💍💖",
      "timestamp": "2026-10-17T23:25:00.000Z"
    }
  ]
}
```

### How to Run in Production (with live file saving)
```bash
# 1. Build the frontend
npm run build

# 2. Start the production server
npm start
```
The production server (`server.js`) will:
- Serve the compiled website on `http://localhost:3000` (or `process.env.PORT`).
- Update `./answer/answer.json` in the project directory in real-time as answers arrive (`POST /api/save-answer`).
- Provide API access at `GET /api/answers` and direct file download at `GET /api/answers/download`.
- Allow updating the questions configuration dynamically in production via `POST /api/update-config`.

---

## 📱 Mobile & Accessibility Verification

- **Responsive Touch Targets**: Buttons have a minimum height of 48px to 58px for comfortable tapping on phones.
- **Contrast**: Headings use `#1E1B4B` and `#881337` on crisp white card backgrounds, ensuring contrast ratio > 7:1.
- **Keyboard Navigation**: Full `Tab`, `Shift+Tab`, `Space`, `Enter`, and `Escape` keyboard control.
- **Reduced Motion**: Respects the user's system motion preference (`prefers-reduced-motion`).
