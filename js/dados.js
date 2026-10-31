// ============================================================
// Livia & Guilherme — dados do site (editar aqui e dar push)
// ============================================================

// ---------- LISTA DE PRESENTES ----------
// Modelo: pagamento direto via link do Mercado Pago
// (mesmo sistema usado em amabillyegabriel.com)
//
// ATUALIZAR (5 min):
// 1. Painel Mercado Pago da Livia: "Criar" > "Link de pagamento"
//    com nome do item e valor fixo → gera link tipo mpago.la/xxxx
// 2. Cole o link em "link" do item.
// 3. Quando alguém pagar: "comprado": true.
// 4. git add . && git commit -m "presente X comprado" && git push
//
// Item sem link ("") aparece como "em breve" (sem botão); cole o link
// mpago.la/... e o item vira pagável automaticamente.
// ============================================================
window.PRESENTES = [
  { nome: "Cortina para a sala",        preco: 150, link: "",     comprado: false },
  { nome: "Jogo de panelas",            preco: 350, link: "",     comprado: false },
  { nome: "Jogo de cama queen",         preco: 450, link: "",     comprado: false },
  { nome: "Aparelho de jantar (8 pax)", preco: 600, link: "",     comprado: false },
  { nome: "Cafeteira elétrica",         preco: 250, link: "",     comprado: false },
  // "Cotas" = pedaços da lua de mel (padrão do modelo de referência):
  { nome: "Cota lua de mel — R$ 250",   preco: 250, link: "",     comprado: false },
  { nome: "Cota lua de mel — R$ 500",   preco: 500, link: "",     comprado: false },
  { nome: "Cota lua de mel — R$ 1.000", preco: 1000, link: "",    comprado: false },
];

// ---------- CONVIDADOS (RSVP "Marque a Data") ----------
// Modelo idêntico ao amabillyegabriel.com: os Nomes dos convidados são
// CADASTRADOS ANTES pelo casal; o convidado digita o próprio nome e
// só aperta "Confirmar presença" / "Não poderei ir".
//
// A busca é insensível a caixa E acento, e aceita nome parcial (main.js):
// "rodrigo", "RODRIGO CAMURÇA", "Rodrigo Camurca" e "pamela dos santos"
// (pulando nome do meio) acham o registro certo.
// Um objeto por convidado: { id: número único, nome: "como será digitado" }
window.CONVIDADOS = [
  { id: 1, nome: "Rodrigo Camurça Vera" },
  { id: 2, nome: "Pamela Talita Correa Dos Santos" },
  { id: 3, nome: "Pamela Camurça Vera" },
];

// Web App do Google Apps Script (banco em Google Sheets) — ver README.
// Enquanto estiver "", as confirmações ficam salvas só no dispositivo.
window.APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzpMSpIfUV9efqAkn2A_ILEfIjqeTu70jUHeu9jK_CUAUWVFEDhdsUNzwr4RX_ZjK-mxg/exec"; // planilha: 1tKLolAmZm36PFlaWjhM1dHFVB_qdpbFjv5p9Uht5TbU

// Prazo pedido para confirmar presença (aparece na seção Presença)
window.PRAZO_RSVP = "01 de março de 2027"; // TODO LIVIA: ajustar

// WhatsApp do casal (dúvidas / RSVP: fallback quando o nome não está na lista)
window.WHATSAPP = "5511983841719"; // 55 + DDD + número, só dígitos
