# Livia & Guilherme — Site do Casamento

Site estático (HTML + CSS + JS puro, sem build, sem servidor): perfeito para o
**GitHub Pages** e custa zero. Paleta e estilo seguem o mockup da noiva
(fundo azul claro em tom único + azul botânico, moldura floral lateral, fotos P&B com borda rasgada).

## Estrutura

```
site/
├── index.html      ← textos, seções, links
├── presentes.html  ← lista completa de presentes ("Ver todos")
├── css/style.css   ← visual (variáveis de cor no topo)
├── css/foto-deckle.css ← borda rasgada da foto (gerada)
├── js/dados.js     ← ★ TODOS OS DADOS: convidados, presentes, WhatsApp, prazo, Apps Script
├── js/main.js      ← contagem, menu, RSVP, modal de presente, PIX
└── img/            ← fotos, moldura floral, monograma LG (monograma.png),
                        nomes caligráficos (nomes.png), favicon e croquis do dress code
```

**Seções, na ordem da página:** Hero (versículo 1 João 4:19 + monograma LG + foto +
nomes) → *O Grande Dia* (cards de acesso rápido: Presença, Presentes, Cerimônia,
Recepção) → Confirme a sua Presença → Lista de Presentes → Dress Code
(PARA ELAS / PARA ELES / NÃO É PERMITIDO) → Nossos Momentos.
As seções antigas *Hospedagem* e *História* foram removidas (podem voltar depois).
O topo da página e o favicon usam o logotipo **LG**.

**Regra de ouro:** quase toda edição é feita em `js/dados.js` — não mexer no HTML/JS para
trocar nome, preço, link ou convidado.

## Ver localmente

Dê duplo clique em `index.html` — abre direto no navegador (testado: funciona
tanto o visual quanto salvar a confirmação na planilha via `file://`).
Para testes automatizados use um servidor: `cd site && python3 -m http.server 8137`.

## Publicar no GitHub Pages (grátis)

Site no ar: **https://rcvdigo.github.io/livia_guilherme/**
(repositório `rcvdigo/livia_guilherme`; Pages já configurado na branch `main`, pasta raiz).

Para publicar qualquer mudança:

```bash
cd site
git add . && git commit -m "troca X" && git push
```

Em ~1 minuto o GitHub Pages atualiza a versão pública — não há outro caminho de publicação.

---

## RSVP “Marque a Data” — como funciona (mesmo mecanismo do site de referência)

O site de referência **não usa formulário**: cada convidado já vem cadastrado na
lista e só digita o próprio nome para confirmar. Replicamos exatamente isso:

- **1.** Os convidados já vêm cadastrados em `js/dados.js` → `CONVIDADOS`
  (hoje são 3: os 2 combinados com o casal + 1 familiar; novos nomes entram no array).
  A busca casa independentemente de caixa e acento e aceita nome parcial —
  `"camurca"` ou `"PAMELA DOS SANTOS"` encontram o registro certo (função `casa()` no `main.js`).
- **2.** O convidado digita o nome → encontra o card → clica
  **Confirmar presença** ou **Não poderei ir**.
- **3.** Nome que não está na lista cai em fallback automático de WhatsApp
  com mensagem pronta (dá pra adicionar gente depois).
- **4.** Abaixo aparece o **mural de quem já confirmou** (o "wall" deles).
- Prazo exibido: campo `PRAZO_RSVP` em `dados.js`.

### Persistência real (Google Sheets, grátis)

Sem isso as confirmações ficariam salvas só no celular de cada convidado
(funcionaria, mas o casal não veria o total). A configuração é única e **já está feita**;
os passos abaixo servem de referência caso precise recriar ou trocar de planilha:

> **Atualização (30/10/2026):** o `Code.gs` agora grava **idempotente por nome** —
> reconfirmar (cliques repetidos, outro aparelho, mudou de ideia) **atualiza a linha**
> do convidado em vez de criar outra. O site também bloqueia clique duplo enquanto
> a primeira escrita está em trânsito. Exige **reimplantar**: cole o `Code.gs`
> atualizado no editor → *Implantar → Gerenciar implantações → lápis → Nova versão*.
> Linhas duplicadas antigas (de testes) não somem sozinhas — apague manualmente.

1. Crie uma planilha no Google Sheets (ex.: "Convidados casamento").
2. Menu **Extensões → Apps Script** → cole o conteúdo de [`Code.gs`](Code.gs) → **Salvar**.
3. Clique em **Implantar → Nova implantação** → tipo **App da Web**:
   - *Executar como*: **Eu (seu e-mail)**
   - *Quem pode acessar*: **Qualquer pessoa**
   - Autorize as permissões quando pedido.
4. Copie a **URL do app da Web** (termina em `/exec`) e cole em `dados.js`
   → campo `APPS_SCRIPT_URL`. Commit + push. Pronto: cada confirmação grava
   num linha nova da planilha (nome, sim/não, data) e o mural lê de lá.

---

## Presentes — pagamento direto, sem intermediário (modelo da referência)

A página principal mostra os **4 primeiros** itens de `PRESENTES`, em 2x2 no desktop (`data-limite="4"`
no `index.html`) e o botão **Ver todos os presentes**, que leva a `presentes.html`,
com a lista completa. O botão só aparece se houver mais de 4 itens; a ordem em
`dados.js` define quais ficam na prévia.

O card mostra nome + preço + botão **Ver detalhes** (como no site deles).
O modal abre com preço, formas de pagamento (PIX / Cartão / Boleto / 12×) e
o botão **Faça o pagamento**.

- Cada item tem um **link de pagamento do Mercado Pago** criado por Livia:
  painel MP → *Criar → Link de pagamento* → valor fixo → copiar `mpago.la/...`
  → colar em `link` do item em `dados.js` (commit + push). O dinheiro cai
  direto na conta MP do casal (zero comissão de lista).
- Fluxo único, como no modelo: **sem WhatsApp no caminho** e **sem botão de
  PIX avulso** — todo pagamento passa pelo link do item (o checkout do MP
  é que oferece PIX/cartão/boleto).
- Item **sem** `link` ainda: aparece como **“em breve”** (sem botão); quando
  o link é colado, o card vira pagável sozinho. Se nenhum item tiver link,
  a seção mostra uma frase de transição.
- Pagou? `"comprado": false` → `true`, commit + push → card vira
  *"comprado com amor ✓"*.

---

## Checklist antes de divulgar

(Itens de texto do site têm o marcador `<!-- TODO LIVIA -->` no `index.html`;
os demais vivem em `dados.js`, no Mercado Pago ou na planilha.)

- [x] **Lista de convidados** em `dados.js` (`CONVIDADOS`) — 3 cadastrados; novos nomes entram no array quando saírem
- [x] Número real do **WhatsApp** em `dados.js` (`WHATSAPP = "5511983841719"`)
- [x] **Apps Script criada e URL em** `APPS_SCRIPT_URL` — planilha `1tKLolAmZm36PFlaWjhM1dHFVB_qdpbFjv5p9Uht5TbU` (aba *Confirmacoes*). Se o `Code.gs` mudar lá no editor, reimplantar: *Implantar → Gerenciar → lápis → Nova versão*.
- [x] **GitHub Pages** no ar em https://rcvdigo.github.io/livia_guilherme/
- [ ] Apagar as linhas de teste da aba *Confirmacoes* na planilha (manter o cabeçalho e as confirmações reais)
- [x] **Reimplantar o `Code.gs` atualizado** (salvar idempotente por nome) — feito em 30/10 como versão 4 da biblioteca; a URL do app continua a mesma
- [x] Igreja confirmada: **Paróquia São Lucas Evangelista**, Av. Inocêncio Seráfico, 2200 — cerimônia 16:00 (link de mapa ativo no card)
- [x] Recepção confirmada: **Espaço Mariana**, Av. Rui Barbosa, 2743 — Vila Santa Terezinha, Carapicuíba — 18:30 (link de mapa ativo no card)
- [ ] **Links Mercado Pago** de cada presente — passo a passo + lista de itens em `../recon/presentes-para-livia.txt`; ao receber o `mpago.la`, colar em `js/dados.js` (o botão vira "Faça o pagamento" sozinho) e marcar `comprado` conforme vai pagando.
- [ ] **Chave PIX** (`data-chave` no index.html)
- [ ] Mais fotos pré-wedding em `img/` + galeria; trocar foto do hero se quiser
- [x] Prazo do RSVP (`PRAZO_RSVP = "01 de março de 2027"`)

## Testes de regressão (opcional)

Scripts Playwright na raiz do projeto (fora de `site/`, não vão pro site):

- `teste-rsvp.mjs` — fluxo completo do RSVP (card, confirmar, mural).
- `teste-convidados.mjs` — busca de nomes em 3 "aparelhos": caixa, acento,
  nome parcial, fallback de WhatsApp, mural global.
- `teste-duplo.mjs` — 5 cliques rápidos no Confirmar geram 1 escrita; nomes
  ambíguos (ex.: duas Pamelas) mostram chips de escolha.
- `shot-florais.mjs` — screenshots mobile (390px) e desktop (1280px) p/ conferir o visual.
- `shot-novo.mjs` — screenshots do hero + dress code (mobile full, desktop hero, dress code).

```bash
cd site && python3 -m http.server 8137 &        # servidor local
LD_LIBRARY_PATH=/home/rcvdigo/local-libs/usr/lib/x86_64-linux-gnu node teste-convidados.mjs
```

(o `LD_LIBRARY_PATH` só é preciso para o Chromium headless achar o libasound neste WSL —
cópia persistente em `/home/rcvdigo/local-libs`; a antiga em `/tmp/libasound` some a cada reinício)
