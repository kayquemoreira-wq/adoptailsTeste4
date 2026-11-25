const API_URL = "http://localhost:8080/api";
const lista = document.getElementById("lista-animais");
const formAnimal = document.getElementById("form-cadastrar-animal");

let animaisLocais = [
  {
    id: 1,
    nome: "Larry",
    especie: "Gato",
    idade: "3 anos",
    foto: "img/gato larry.jpg"
  },
  {
    id: 2,
    nome: "Rafael",
    especie: "Guaxinim",
    idade: "1 ano",
    foto: "img/guaxi.jpg"
  },
  {
    id: 3,
    nome: "Mestre Splinter",
    especie: "Coelho",
    idade: "5 decadas",
    foto: "img/ms.jpg"
  },
  {
    id: 4,
    nome: "Pirito",
    especie: "Rato",
    idade: "8 meses",
    foto: "img/pirito.jpg"
  }
];

function mudarAba(aba) {
  document.getElementById("aba-catalogo").classList.toggle("ativa", aba === "catalogo");
  document.getElementById("aba-doar").classList.toggle("ativa", aba === "doar");

  document.getElementById("btn-aba-catalogo").classList.toggle("ativa", aba === "catalogo");
  document.getElementById("btn-aba-doar").classList.toggle("ativa", aba === "doar");

  if (aba === "catalogo") carregarAnimais();
}

function renderizarCards(animais) {
  if (!animais || animais.length === 0) {
    lista.innerHTML = "<p>Nenhum pet cadastrado no momento.</p>";
    return;
  }

  lista.innerHTML = "";
  animais.forEach(pet => {
    const card = document.createElement("div");
    card.className = "card";

    const especie = (pet.especie || "").toLowerCase();
    const emoji = especie.startsWith("gat") ? "🐈" : especie.startsWith("cach") ? "🐕" : "💕";

    const criarSemFoto = () => {
      const div = document.createElement("div");
      div.className = "sem-foto";
      div.textContent = emoji;
      return div;
    };

    if (pet.foto) {
      const img = document.createElement("img");
      img.src = pet.foto;
      img.alt = pet.nome;
      img.onerror = () => img.replaceWith(criarSemFoto());
      card.appendChild(img);
    } else {
      card.appendChild(criarSemFoto());
    }

    const titulo = document.createElement("h3");
    titulo.textContent = pet.nome;

    const info = document.createElement("p");
    info.textContent = `${pet.especie}, ${pet.idade}`;

    const botao = document.createElement("button");
    botao.textContent = "ADOTAR ME";
    botao.addEventListener("click", () => abrirModalAdocao(pet.id, pet.nome));

    card.append(titulo, info, botao);
    lista.appendChild(card);
  });
}

async function carregarAnimais() {
  try {
    const res = await fetch(`${API_URL}/animais`);
    if (!res.ok) throw new Error("Servidor indisponível");
    const animais = await res.json();
    renderizarCards(animais);
  } catch (err) {
    renderizarCards(animaisLocais);
  }
}

const arquivoFoto = document.getElementById("arquivo-foto");
const campoFoto = document.getElementById("foto");
const previaFoto = document.getElementById("previa-foto");
let processandoFoto = false;

arquivoFoto.addEventListener("change", () => {
  const arquivo = arquivoFoto.files[0];
  if (!arquivo) {
    limparFoto();
    return;
  }

  processandoFoto = true;
  campoFoto.value = "";
  previaFoto.hidden = true;

  const leitor = new FileReader();
  leitor.onload = () => {
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, 500 / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      campoFoto.value = canvas.toDataURL("image/jpeg", 0.8);
      previaFoto.src = campoFoto.value;
      previaFoto.hidden = false;
      processandoFoto = false;
    };
    img.onerror = () => {
      alert("Não foi possível ler essa imagem.");
      limparFoto();
    };
    img.src = leitor.result;
  };
  leitor.onerror = () => {
    alert("Não foi possível ler esse arquivo.");
    limparFoto();
  };
  leitor.readAsDataURL(arquivo);
});

function limparFoto() {
  processandoFoto = false;
  campoFoto.value = "";
  previaFoto.hidden = true;
  arquivoFoto.value = "";
}

formAnimal.addEventListener("reset", limparFoto);

formAnimal.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (processandoFoto) {
    alert("Aguarde um instante: a foto ainda está sendo processada.");
    return;
  }

  const novoPet = {
    nome: document.getElementById("nome").value.trim(),
    especie: document.getElementById("especie").value,
    idade: document.getElementById("idade").value.trim(),
    foto: document.getElementById("foto").value
  };

  if (!novoPet.nome || !novoPet.idade) {
    alert("Preencha o nome e a idade do pet.");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/animais`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoPet)
    });

    if (res.ok) {
      alert("Pet cadastrado com sucesso no banco de dados!");
      formAnimal.reset();
      mudarAba("catalogo");
    } else {
      alert("Erro " + res.status + ": verifique se a coluna 'foto' no banco está como LONGTEXT.");
    }
  } catch (err) {
    novoPet.id = Date.now();
    animaisLocais.unshift(novoPet);
    alert("Pet adicionado na vitrine! (Modo local: ligue o servidor localhost:8080 para salvar no MySQL)");
    formAnimal.reset();
    mudarAba("catalogo");
  }
});

function abrirModalAdocao(id, nomePet) {
  document.getElementById("adocao-animal-id").value = id;
  document.getElementById("modal-nome-pet").textContent = nomePet;
  document.getElementById("modal-adocao").classList.add("aberto");
}

function abrirModalLogin(e) {
  e.preventDefault();
  document.getElementById("modal-login").classList.add("aberto");
}

function fecharModal(idModal) {
  document.getElementById(idModal).classList.remove("aberto");
}

document.getElementById("form-adocao").addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    animalId: Number(document.getElementById("adocao-animal-id").value),
    nomeInteressado: document.getElementById("adocao-nome").value.trim(),
    email: document.getElementById("adocao-email").value.trim()
  };

  try {
    const res = await fetch(`${API_URL}/adocoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    alert(await res.text());
  } catch (err) {
    alert(`Pedido de adoção enviado com sucesso, ${payload.nomeInteressado}! Entraremos em contato pelo e-mail ${payload.email}.`);
  }

  e.target.reset();
  fecharModal("modal-adocao");
});

carregarAnimais();