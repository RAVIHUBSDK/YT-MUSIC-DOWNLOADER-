const express = require("express");
const yts = require("yt-search");
const fs = require("fs");
const session = require("express-session");
const YtDlpWrap = require("yt-dlp-wrap").default; // ✅ use yt-dlp-wrap
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "ravi-secret-key",
  resave: false,
  saveUninitialized: true
}));

app.use(express.static("public"));

// 🔐 AUTH CHECK
function auth(req, res, next) {
  if (req.session.login) return next();
  res.redirect("/login.html");
}

// LOGIN ROUTE
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Ravi-king" && password === "957946") {
    req.session.login = true;
    res.redirect("/");
  } else {
    res.send("❌ Invalid Username or Password");
  }
});

// Protect main site
app.get("/", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// YouTube search
app.post("/search", auth, async (req, res) => {
  try {
    const r = await yts(req.body.query);
    res.json(r.videos.slice(0, 6));
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Download video/audio
app.post("/download", auth, async (req, res) => {
  const { url, type, quality } = req.body;
  fs.mkdirSync("temp", { recursive: true });
  const out = "temp/file.%(ext)s";

  const ytdlp = new YtDlpWrap(); // create yt-dlp instance

  const args = [];
  if (type === "mp3") {
    args.push("-x", "--audio-format", "mp3", "--audio-quality", quality, "-o", out, url);
  } else {
    args.push("-f", "mp4", "-o", out, url);
  }

  try {
    await ytdlp.exec(args);
    const file = fs.readdirSync("temp")[0];
    res.download(path.join("temp", file), () =>
      fs.rmSync("temp", { recursive: true, force: true })
    );
  } catch (err) {
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
