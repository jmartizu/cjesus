
let songs=[];
let selected=[];
let currentSection="Todas";

async function loadSongs(){
const r=await fetch("songs.json");
songs=await r.json();
renderSections();
renderSongs();
}

function renderSections(){
const c=document.getElementById("sections");
c.innerHTML="";
const s=["Todas",...new Set(songs.map(x=>x.section))];
s.forEach(sec=>{
const d=document.createElement("div");
d.textContent=sec;
d.onclick=()=>{currentSection=sec;renderSongs();};
c.appendChild(d);
});
}

function renderSongs(){
const c=document.getElementById("songs");
c.innerHTML="";
const search=(document.getElementById("search").value||"").toLowerCase();

songs.filter(x=>
(currentSection==="Todas"||x.section===currentSection)&&
x.title.toLowerCase().includes(search)
).forEach(s=>{

const row=document.createElement("div");
row.textContent=s.title;

const btn=document.createElement("button");
btn.textContent="Añadir";
btn.className="song-btn";
btn.onclick=(e)=>{
e.stopPropagation();
if(!selected.find(x=>x.id===s.id)){
selected.push(s);
renderSelected();
}
};

row.appendChild(btn);
row.onclick=()=>openSong(s);

c.appendChild(row);
});
}

function renderSelected(){
const c=document.getElementById("selectedList");
c.innerHTML="";

selected.forEach((s,i)=>{

const row=document.createElement("div");
row.className="selected-item";

const title=document.createElement("div");
title.textContent=s.title;

const actions=document.createElement("div");
actions.className="action-buttons";

const eye=document.createElement("button");
eye.className="eye-btn";
eye.textContent="👁";
eye.onclick=()=>openSong(s);

const remove=document.createElement("button");
remove.className="remove-btn";
remove.textContent="X";
remove.onclick=()=>{
selected.splice(i,1);
renderSelected();
};

actions.appendChild(eye);
actions.appendChild(remove);

row.appendChild(title);
row.appendChild(actions);
c.appendChild(row);
});
}

function openSong(song){
document.getElementById("songTitle").textContent=song.title;
document.getElementById("songSection").textContent="Sección: "+song.section;
document.getElementById("songBody").innerHTML='<img src="'+song.image+'" class="song-image">';
document.getElementById("songDialog").showModal();
}

document.getElementById("downloadBtn").addEventListener("click",async()=>{

if(selected.length===0){alert("No hay canciones seleccionadas");return;}

const { jsPDF } = window.jspdf;
const pdf = new jsPDF();

for(let i=0;i<selected.length;i++){

const img = new Image();
img.src = selected[i].image;

await new Promise(resolve=>{
img.onload = resolve;
});

if(i>0) pdf.addPage();

pdf.setFontSize(18);
pdf.text(selected[i].title, 10, 15);
pdf.addImage(img, 'PNG', 10, 25, 180, 250);
}

pdf.save("Programa-de-Misa.pdf");

});

document.getElementById("search").addEventListener("input",renderSongs);
document.getElementById("closeBtn").addEventListener("click",()=>document.getElementById("songDialog").close());

loadSongs();
