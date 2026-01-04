const express = require("express");
const yts = require("yt-search");
const fs = require("fs");
const session = require("express-session");
const ytdlp = require("yt-dlp-exec");

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
  if(req.session.login) return next();
  res.redirect("/login.html");
}

// LOGIN ROUTE
app.post("/login", (req,res)=>{
  const {username,password} = req.body;
  if(username==="Ravi-king" && password==="957946"){
    req.session.login = true;
    res.redirect("/");
  } else {
    res.send("❌ Invalid Username or Password");
  }
});

// Protect main site
app.get("/", auth, (req,res)=>{
  res.sendFile(__dirname+"/public/index.html");
});

// YouTube search
app.post("/search", auth, async (req,res)=>{
  const r = await yts(req.body.query);
  res.json(r.videos.slice(0,6));
});

// Download video/audio
app.post("/download", auth, async (req,res)=>{
  const { url, type, quality } = req.body;
  fs.mkdirSync("temp",{recursive:true});
  const out = "temp/file.%(ext)s";

  try{
    await ytdlp(url,{
      x: type==="mp3",
      f: type==="mp4" ? "mp4" : undefined,
      o: out,
      audio_format: type==="mp3" ? "mp3" : undefined,
      audio_quality: type==="mp3" ? quality : undefined
    });
    const file = fs.readdirSync("temp")[0];
    res.download("temp/"+file, ()=> fs.rmSync("temp",{recursive:true,force:true}));
  }catch(err){
    res.status(500).send(err.message);
  }
});

app.listen(3000,()=>console.log("Server running on 3000"));
