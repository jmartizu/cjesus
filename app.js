
let songs = [];
let selected = [];
let currentSection = "Todas";

async function loadSongs(){
  const r = await fetch("songs.json");
  songs = await r.json();
  renderSections();
  renderSongs();
}

function renderSections(){
  const c = document.getElementById("sections");
  c.innerHTML = "";

  const ordenLiturgico = [
    "Entrada",
    "Acto Penitencial",
    "Gloria",
    "Salmo",
    "Aleluya",
    "Ofertorio",
    "Santo",
    "Paz",
    "Comunión",
    "Acción de Gracias",
    "Salida"
  ];

  const categoriasExistentes = [...new Set(songs.map(x => x.section.trim()))];

  let categoriasOrdenadas = [];

  ordenLiturgico.forEach(cat => {
    if(categoriasExistentes.includes(cat)){
      categoriasOrdenadas.push(cat);
    }
  });

  categoriasExistentes.forEach(cat => {
    if(!categoriasOrdenadas.includes(cat)){
      categoriasOrdenadas.push(cat);
    }
  });

  const seccionesFinales = ["Todas", ...categoriasOrdenadas];

  seccionesFinales.forEach(sec => {
    const d = document.createElement("div");
    d.textContent = sec;

    if(sec === currentSection){
      d.classList.add("active-section");
    }

    d.onclick = () => {
      currentSection = sec;
      renderSections();
      renderSongs();
    };

    c.appendChild(d);
  });
}

function renderSongs(){
  const c = document.getElementById("songs");
  c.innerHTML = "";
  const search = (document.getElementById("search").value || "").toLowerCase();

  songs
  .filter(x =>
    (currentSection==="Todas" || x.section===currentSection) &&
    x.title.toLowerCase().includes(search)
  )
  .sort((a,b) => a.title.localeCompare(b.title))
  .forEach(s => {

    const row = document.createElement("div");
    row.textContent = s.title;

    const btn = document.createElement("button");
    btn.textContent = "Añadir";
    btn.className = "song-btn";
    btn.onclick = (e) => {
      e.stopPropagation();
      if(!selected.find(x => x.id === s.id)){
        selected.push(s);
        renderSelected();
      }
    };

    row.appendChild(btn);
    row.onclick = () => openSong(s);
    c.appendChild(row);
  });
}

function renderSelected(){
  const c = document.getElementById("selectedList");
  c.innerHTML = "";

  selected.forEach((s,i)=>{

    const row = document.createElement("div");
    row.className="selected-item";

    const title = document.createElement("div");
    title.textContent = s.title;

    const actions = document.createElement("div");
    actions.className="action-buttons";

    const eye = document.createElement("button");
    eye.className="eye-btn";
    eye.textContent="👁";
    eye.onclick=()=>openSong(s);

    const remove = document.createElement("button");
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
  document.getElementById("songTitle").textContent = song.title;
  document.getElementById("songSection").textContent = "Sección: " + song.section;
  document.getElementById("songBody").innerHTML =
    '<img src="'+song.image+'" class="song-image">';
  document.getElementById("songDialog").showModal();
}

document.getElementById("downloadBtn").addEventListener("click", async ()=>{

  if(selected.length===0){
    alert("No hay canciones seleccionadas");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < selected.length; i++) {

    if(i > 0) pdf.addPage();

    pdf.setFontSize(18);
    pdf.text(selected[i].section, 10, 15);

    pdf.setFontSize(16);
    pdf.text(selected[i].title, 10, 25);

    const img = new Image();
    img.src = selected[i].image;

    await new Promise(resolve => {
      img.onload = resolve;
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = img.width;
    const imgHeight = img.height;

    const ratio = Math.min(
      (pageWidth - 20) / imgWidth,
      (pageHeight - 50) / imgHeight
    );

    const newWidth = imgWidth * ratio;
    const newHeight = imgHeight * ratio;

    pdf.addImage(img, 'PNG', 10, 35, newWidth, newHeight);
  }

  pdf.save("Programa-de-Misa.pdf");
});

document.getElementById("search").addEventListener("input", renderSongs);
document.getElementById("closeBtn").addEventListener("click", ()=>{
  document.getElementById("songDialog").close();
});

loadSongs();
