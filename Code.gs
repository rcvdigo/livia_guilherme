/**
 * Casamento Livia & Guilherme — backend do RSVP (grátis)
 *
 * Como usar (já está no README.md):
 * 1. Planilha Google Sheets nova → Extensões → Apps Script → cole este arquivo
 * 2. Implantar → Nova implantação → App da Web
 *    • Executar como: Eu
 *    • Quem pode acessar: Qualquer pessoa
 * 3. Cole a URL (/exec) em js/dados.js → APPS_SCRIPT_URL
 *
 * Cada confirmação vira UMA linha na aba "Confirmacoes":
 * data | nome | status  (o site envia via GET ?salvar=1&nome=&status=)
 * Reconfirmar o MESMO nome (mesma pessoa digitando de novo, cliques
 * repetidos, outro aparelho) ATUALIZA a linha existente em vez de
 * criar outra — a planilha não enche de duplicadas.
 * O GET ?action=listar devolve o último status de cada nome (monta o mural).
 */

var ABA = "Confirmacoes";

// Chave de identidade do convidado: sem caixa/acentos/espacos extras,
// igual à normalização que o site faz (main.js → norm).
function normKey(s) {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Grava (ou atualiza) a confirmação. Idempotente por nome: se já existe
// uma linha deste convidado, sobrescreve data+status nela.
function gravar(nome, status) {
  var sh = getSheet();
  var vals = sh.getDataRange().getValues();
  var alvo = -1; // índice 1-based da linha existente (0 = não achou)
  for (var i = 1; i < vals.length; i++) {
    if (vals[i][1] && normKey(vals[i][1]) === normKey(nome)) { alvo = i + 1; break; }
  }
  if (alvo > 0) {
    sh.getRange(alvo, 1).setValue(new Date());
    sh.getRange(alvo, 3).setValue(status);
  } else {
    sh.appendRow([new Date(), String(nome), String(status)]);
  }
}

function doGet(e) {
  var out = "";
  var q = (e && e.parameter) || {};
  if (q.salvar === "1" && q.nome && q.status) {
    // Grava/atualiza a confirmação. O envio é GET de propósito: ao seguir o
    // redirect 302 do Apps Script, o navegador converte o POST em GET e o
    // corpo se perde (403 no destino) — via querystring não há corpo a perder.
    try {
      gravar(String(q.nome).trim(), String(q.status).trim());
    } catch (err) {}
    out = "ok";
  } else if (q.action === "listar") {
    var sh = getSheet();
    var last = {};
    var vals = sh.getDataRange().getValues();
    for (var i = 1; i < vals.length; i++) {
      if (vals[i][1]) {
        var k = String(vals[i][1]).trim().toLowerCase();
        last[k] = String(vals[i][2]); // sobrepõe: último status vence
      }
    }
    var arr = [];
    Object.keys(last).forEach(function (k) {
      arr.push({ nome: k, status: last[k] });
    });
    out = JSON.stringify(arr);
  }
  return ContentService.createTextOutput(out).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var nome = "", status = "";
  try {
    if (e && e.postData && e.postData.parameters) {
      // formato 1: formulário (nome=...&status=...)
      nome = String(e.postData.parameters.nome || "").trim();
      status = String(e.postData.parameters.status || "").trim();
    } else if (e && e.postData && e.postData.contents) {
      // formato 2: JSON (\"nome\": ... \"status\": ...) — usado pelo site
      var d = JSON.parse(e.postData.contents);
      nome = String(d.nome || "").trim();
      status = String(d.status || "").trim();
    }
    if (nome && status) {
      gravar(nome, status);
    }
  } catch (err) {
    // ignora: o front já tem fallback local
  }
  return ContentService.createTextOutput("ok").setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA);
  if (!sh) {
    sh = ss.insertSheet(ABA);
    sh.appendRow(["data", "nome", "status"]);
  }
  return sh;
}
