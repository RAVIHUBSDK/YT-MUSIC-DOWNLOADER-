let currentUrl = "";

function doSearch() {
  fetch("/search",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({query:search.value})
  })
  .then(r=>r.json())
  .then(videos=>{
    results.innerHTML="";
    videos.forEach(v=>{
      const d=document.createElement("div");
      d.innerText=v.title;
      d.onclick=()=>{
        currentUrl=v.url;
        player.src="https://www.youtube.com/embed/"+v.videoId;
      };
      results.appendChild(d);
    });
  });
}

function download(type){
  fetch("/download",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({url:currentUrl,type:type,quality:quality.value})
  });
}
