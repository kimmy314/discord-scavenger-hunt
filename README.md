# 🧗 Discord Scavenger Hunt Bot

A Discord bot to run a scavenger hunt game with climbing gyms, using Google Sheets as the source of data. Hints are released on a schedule, users report found climbs, and points are tracked per user and server.

---

## 📋 Features
- Scheduled hint releases pulled from a Google Sheet.
- Tracks user and server points.
- Supports multiple gyms per set.
- Points awarded decrease as more hints are given.
- Admin-only controls for creating and resetting hunts.
- Leaderboard with `/rank`.

---


## 🚀 Getting Started

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/kimmy314/discord-scavenger-hunt.git
cd discord-scavenger_hunt
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Discord Bot Setup
You need to create your own **Discord App / Bot Token**:
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application.
3. Add a **Bot** to the application.
4. Under **Bot Settings**, enable:
   - `MESSAGE CONTENT INTENT`
   - `GUILD MEMBERS INTENT`
   - `GUILDS INTENT`
5. Copy your **Bot Token**.

---

### 4️⃣ Create `config.json`
Create this file in the root of your repo:

```json
{
    "token": "YOUR_DISCORD_BOT_TOKEN",
    "clientId": "YOUR_APPLICATION_CLIENT_ID",
    "guildId": "YOUR_DISCORD_GUILD_ID"
}
```

---

### 5️⃣ Deploy Commands to Discord
```bash
node deploy-commands.js
```

---

### 6️⃣ Run the Bot
```bash
node index.js
```

---

## 🛠 Admin Commands (Only Kim / Admin User Can Run)

| Command        | Description                  |
|----------------|------------------------------|
| `/create_hunt` | Start a hunt in a channel     |
| `/reset_hunt`  | Reset the hunt for the channel|
| `/status`      | View current hunt status      |

---

## 🧑‍🤝‍🧑 User Commands

| Command   | Description                 |
|-----------|-----------------------------|
| `/found`  | Submit a find (set # + kaya) |
| `/rank`   | View leaderboard             |

---

## 📝 Notes
- Google Sheet must match this format:

```
Set # | Start Date | Gym | Kaya Id | Hint 1 | Hint 2 | ...
```

- Sheet must be **publicly viewable** as CSV.

---
