const express = require("express");
const yts = require("yt-search");
const { exec } = require("child_process");
const fs = require("fs");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "ravi-secret-key",
    resave: false,
    saveUninitialized: true
  })
);

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
  res.sendFile(__dirname + "/public/index.html");
});

// YouTube Search
app.post("/search", auth, async (req, res) => {
  const r = await yts(req.body.query);
  res.json(r.videos.slice(0, 6));
});

// Download
app.post("/download", auth, (req, res) => {
  const { url, type, quality } = req.body;
  fs.mkdirSync("temp", { recursive: true });

  const out = "temp/file.%(ext)s";
  const cmd =
    type === "mp3"
      ? `yt-dlp -x --audio-format mp3 --audio-quality ${quality} -o "${out}" ${url}`
      : `yt-dlp -f mp4 -o "${out}" ${url}`;

  exec(cmd, () => {
    const file = fs.readdirSync("temp")[0];
    res.download("temp/" + file, () =>
      fs.rmSync("temp", { recursive: true, force: true })
    );
  });
});

app.listen(3000, () => console.log("Server running on 3000"));
