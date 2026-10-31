// Livia & Guilherme — interação mínima, sem dependências

// ---------- contagem regressiva (TODO: conferir data/horário) ----------
const DATA = new Date("2027-05-01T16:00:00-03:00");

const $ = (id) => document.getElementById(id);
function atualizarCountdown() {
  const diff = DATA - Date.now();
  let d, h, m, s;
  if (diff <= 0) {
    d = "🎉";
    h = m = s = "—";
  } else {
    d = String(Math.floor(diff / 864e5));
    h = String(Math.floor(diff / 36e5) % 24).padStart(2, "0");
    m = String(Math.floor(diff / 6e4) % 60).padStart(2, "0");
    s = String(Math.floor(diff / 1e3) % 60).padStart(2, "0");
  }
  $("cd-d").textContent = d;
  $("cd-h").textContent = h;
  $("cd-m").textContent = m;
  $("cd-s").textContent = s;
}
if ($("countdown")) { // só existe na página principal
  atualizarCountdown();
  setInterval(atualizarCountdown, 1000);
}

// ---------- menu mobile ----------
const nav = $("nav");
const toggle = $("navToggle");
toggle.addEventListener("click", () => {
  const aberto = nav.classList.toggle("aberto");
  toggle.setAttribute("aria-expanded", aberto);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("aberto");
    toggle.setAttribute("aria-expanded", "false");
  }
});

// ---------- lightbox ----------
const lightbox = $("lightbox");
if (lightbox) { // só existe na página principal
  const lightboxImg = lightbox.querySelector("img");
  document.querySelectorAll(".galeria img").forEach((img) => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });
  const fecharLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  };
  lightbox.querySelector(".lightbox__fechar").addEventListener("click", fecharLightbox);
  lightbox.addEventListener("click", (e) => e.target === lightbox && fecharLightbox());
  addEventListener("keydown", (e) => e.key === "Escape" && !lightbox.hidden && fecharLightbox());
}

// ---------- lista de presentes (modal "Ver detalhes", modelo da referência) ----------
const fmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const grade = $("gradePresentes");
if (grade && window.PRESENTES) {
  const temLink = (p) => /^https?:\/\//i.test(p.link || "");
  // Fluxo único (modelo amabillyegabriel.com): o pagamento SÓ acontece pelo
  // link do Mercado Pago do item. Sem WhatsApp, sem PIX avulso.
  // Estados do card: "em breve" (sem link) -> "Ver detalhes"/"Faça o
  // pagamento" (com link) -> "comprado com amor ✓". Colar o link em
  // dados.js + push já promove o card.
  // data-limite na grade = prévia (página principal); sem ele = lista completa.
  const limite = +grade.dataset.limite || Infinity;
  const verTodos = $("verTodos");
  if (verTodos) verTodos.hidden = window.PRESENTES.length <= limite;
  grade.innerHTML = window.PRESENTES.length === 0
    ? '<p class="minusc grade-vazia">A listinha de presentes está sendo preparada — em breve você poderá escolher o seu aqui.</p>'
    : window.PRESENTES.slice(0, limite).map((p, i) => `
    <article class="presente ${p.comprado ? "presente--comprado" : ""}" data-reveal style="--rd:${(i % 4) * 90}ms">
      <span class="presente__num">${String(i + 1).padStart(2, "0")}</span>
      <h3>${p.nome}</h3>
      <p class="presente__preco">${fmt.format(p.preco)}</p>
      ${p.comprado
        ? '<span class="selo-ok">comprado com amor ✓</span>'
        : temLink(p)
          ? `<button class="botao" type="button" data-idx="${i}">Ver detalhes</button>`
          : '<span class="selo-breve">em breve</span>'}
    </article>`).join("");

  const modal = $("modalPresente");
  const mNome = $("modalNome"), mPreco = $("modalPreco"), mNota = $("modalNota"), mCta = $("modalCta");
  const abrirModal = (p) => {
    mNome.textContent = p.nome;
    mPreco.textContent = fmt.format(p.preco);
    mCta.href = p.link;
    mCta.textContent = "Faça o pagamento";
    mNota.textContent = "Pagamento direto para a conta do casal, via Mercado Pago — cartão em até 12x, PIX ou boleto.";
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  };
  const fecharModal = () => { modal.hidden = true; document.body.style.overflow = ""; };
  grade.querySelectorAll("button[data-idx]").forEach((btn) =>
    btn.addEventListener("click", () => abrirModal(window.PRESENTES[+btn.dataset.idx])));
  modal.querySelector(".modal__fechar").addEventListener("click", fecharModal);
  modal.addEventListener("click", (e) => e.target === modal && fecharModal());
  addEventListener("keydown", (e) => e.key === "Escape" && !modal.hidden && fecharModal());
}

// ---------- RSVP “Marque a Data” ----------
// Mecanismo idêntico ao amabillyegabriel.com: nomes cadastrados antes,
// convidado digita o próprio nome e confirma. Persistência real via
// Google Apps Script (Google Sheets); sem URL, salva só no dispositivo.
(function rsvp() {
  const input = $("rsvpInput"), statusEl = $("rsvpStatus"), mural = $("rsvpMural"), prazo = $("rsvpPrazo");
  if (!input || !statusEl) return;
  const CONVIDADOS = window.CONVIDADOS || [];
  const SCRIPT = (window.APPS_SCRIPT_URL || "").replace(/\/+$/, "");
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  // casa: insensível a caixa e acento. Aceita prefixo ("pamela"), substring
  // ("camurca") ou nome parcial com palavras puladas: toda palavra digitada
  // precisa existir no nome cadastrado ("pamela dos santos" casa com
  // "Pamela Talita Correa Dos Santos").
  const casa = (c, t) => {
    const n = norm(c.nome);
    if (!t) return false;
    if (n === t || n.startsWith(t) || (t.length >= 3 && n.includes(t))) return true;
    const digitadas = norm(t).split(/\s+/).filter((w) => w.length >= 2);
    const registradas = n.split(/\s+/);
    return digitadas.length > 0 && digitadas.every((w) => registradas.includes(w));
  };
  const wa = (msg) => `https://wa.me/${window.WHATSAPP || ""}?text=${encodeURIComponent(msg)}`;
  const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let locais = {};
  try { locais = JSON.parse(localStorage.getItem("lvgh-rsvp") || "{}"); } catch {}
  let remotos = {};
  const statusDe = (k) => remotos[k] || (locais[k] && locais[k].status) || null;

  if (SCRIPT) {
    fetch(SCRIPT + "?action=listar")
      .then((r) => r.json())
      .then((d) => { (d || []).forEach((g) => (remotos[norm(g.nome)] = g.status)); desenharMural(); })
      .catch(() => {});
  }

  if (prazo) prazo.textContent = `Pedimos gentileza de confirmar até ${window.PRAZO_RSVP || "a data a ser divulgada"} — assim que tiver certeza!`;

  function desenharMural() {
    const confirmado = Object.keys({ ...locais, ...remotos }).filter((k) => statusDe(k) === "sim");
    if (!confirmado.length) { mural.hidden = true; mural.innerHTML = ""; return; }
    const nomes = confirmado
      .map((k) => (CONVIDADOS.find((c) => norm(c.nome) === k) || {}).nome || k)
      .sort((a, b) => a.localeCompare(b, "pt-BR"));
    mural.hidden = false;
    mural.innerHTML =
      `<p class="rsvp__mural-titulo">${nomes.length} ${nomes.length === 1 ? "convidado já confirmou" : "convidados já confirmaram"} 🎉</p>` +
      `<div class="rsvp__chips rsvp__chips--mural">${nomes.map((n) => `<span class="chip chip--ok">${escapeHtml(n)}</span>`).join("")}</div>`;
  }

  function enviarParaPlanilha(nome, st) {
    if (!SCRIPT) return Promise.resolve();
    // GET de propósito: o redirect 302 do Apps Script converte POST em GET
    // e o corpo se perde no caminho (403). Querystring chega sempre.
    return fetch(
      SCRIPT + "?salvar=1&nome=" + encodeURIComponent(nome) + "&status=" + encodeURIComponent(st)
    )
      .then((r) => r.text())
      .then((t) => { if (t !== "ok") console.warn("RSVP: resposta inesperada da planilha:", t); })
      .catch(() => {});
  }

  let enviando = null; // "chave:status" em trânsito — bloqueia clique duplo

  function responder(c, st) {
    const k = norm(c.nome);
    const marca = k + ":" + st;
    if (enviando === marca) return; // mesma confirmação já vai a caminho
    enviando = marca;
    statusEl.querySelectorAll("button[data-st]").forEach((x) => (x.disabled = true));
    locais[k] = { status: st, quando: Date.now() };
    try { localStorage.setItem("lvgh-rsvp", JSON.stringify(locais)); } catch {}
    enviarParaPlanilha(c.nome, st).then(() => {
      if (enviando === marca) enviando = null;
      statusEl.querySelectorAll("button[data-st]").forEach((x) => (x.disabled = false));
    });
    desenhar();
    desenharMural();
  }

  function desenhar() {
    const t = norm(input.value.trim());
    if (!t) {
      statusEl.innerHTML = `<p class="rsvp__dica">Digite seu nome como ele aparece no convite — nós dois vamos adorar ver você aqui.</p>`;
      return;
    }
    if (!CONVIDADOS.length) {
      statusEl.innerHTML = `<p class="rsvp__dica">Estamos finalizando a listinha de convidados — se quiser se antecipar:</p><a class="botao" href="${wa("Olá! Quero confirmar minha presença no casamento de vocês!")}" target="_blank" rel="noopener">Chamar no WhatsApp</a>`;
      return;
    }
    const matches = CONVIDADOS.filter((c) => casa(c, t));
    if (matches.length === 1) {
      const c = matches[0], st = statusDe(norm(c.nome));
      statusEl.innerHTML = `
        <div class="rsvp__cartao">
          <p class="rsvp__cartao-nome">${escapeHtml(c.nome)}</p>
          ${st === "sim" ? '<p class="rsvp__cartao-msg">Presença confirmada! A gente já vai se preparar pra te abraçar. ✓</p>'
            : st === "nao" ? '<p class="rsvp__cartao-msg">Sentiremos sua falta! Obrigado(a) por nos avisar com carinho.</p>'
            : '<p class="rsvp__cartao-msg">Que bom ter você com a gente! Consegue estar presente?</p>'}
          <div class="fileira-botoes">
            <button class="botao ${st === "sim" ? "botao--ativo" : ""}" type="button" data-st="sim">Confirmar presença</button>
            <button class="botao ${st === "nao" ? "botao--ativo" : ""}" type="button" data-st="nao">Não poderei ir</button>
          </div>
        </div>`;
      statusEl.querySelectorAll("button[data-st]").forEach((b) =>
        b.addEventListener("click", () => responder(c, b.dataset.st)));
    } else if (matches.length > 1) {
      statusEl.innerHTML = `<p class="rsvp__dica">Você seria uma dessas pessoas?</p>
        <div class="rsvp__chips">${matches.slice(0, 6).map((c) => `<button class="chip" type="button" data-nome="${escapeHtml(c.nome)}">${escapeHtml(c.nome)}</button>`).join("")}</div>`;
      statusEl.querySelectorAll("button.chip").forEach((b) =>
        b.addEventListener("click", () => { input.value = b.dataset.nome; desenhar(); }));
    } else {
      statusEl.innerHTML = `<p class="rsvp__dica rsvp__dica--erro">Poxa... esse nome não está na lista de convidados.</p>
        <p class="rsvp__dica">Se você foi convidado(a) e não achou seu nome, chama a gente:</p>
        <a class="botao" href="${wa(`Olá! Sou convidado(a) e não encontrei meu nome (“${input.value.trim()}”) no site. Posso confirmar minha presença?`)}" target="_blank" rel="noopener">Chamar no WhatsApp</a>`;
    }
  }

  input.addEventListener("input", desenhar);
  desenhar();
  desenharMural();
})();

// ============================================================
// efeitos visuais v2 — reveal ao rolar, topbar, parallax
// ============================================================
const REDUZIDO = matchMedia("(prefers-reduced-motion: reduce)").matches;

// stagger automático entre vizinhos que aparecem juntos
if (!REDUZIDO) {
  document.querySelectorAll("main .grade-dia, main .galeria").forEach((grupo) => {
    [...grupo.children].forEach((el, i) => el.style.setProperty("--rd", `${Math.min(i * 110, 440)}ms`));
  });
}

// revela elementos quando entram na viewport
function registrarReveals() {
  const alvos = document.querySelectorAll("[data-reveal]:not(.visivel)");
  if (REDUZIDO || !("IntersectionObserver" in window)) {
    alvos.forEach((el) => el.classList.add("visivel"));
    return;
  }
  const io = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.05 }
  );
  alvos.forEach((el) => io.observe(el));
}
registrarReveals();

// topbar compacta + sombra depois de rolar
const topbar = document.querySelector(".topbar");
let parAtivo = false;
function aoRolar() {
  topbar.classList.toggle("rolado", scrollY > 50);
  // moldura floral desliza mais devagar que o conteúdo (parallax sutil)
  if (!REDUZIDO) document.documentElement.style.setProperty("--par", `-${(scrollY * 0.12).toFixed(1)}px`);
  parAtivo = false;
}
addEventListener(
  "scroll",
  () => {
    if (!parAtivo) {
      parAtivo = true;
      requestAnimationFrame(aoRolar);
    }
  },
  { passive: true }
);
aoRolar();
