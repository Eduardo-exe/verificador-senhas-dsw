const campoSenha = document.getElementById("senha");
const botaoMostrar = document.getElementById("mostrar");
const botaoVerificar = document.getElementById("verificar");
const areaResultado = document.getElementById("resultado");
const msgVazamento = document.getElementById("msg-vazamento");
const msgForca = document.getElementById("msg-forca");
const msgAviso = document.getElementById("msg-aviso");

// Mostrar / ocultar a senha digitada
botaoMostrar.addEventListener("click", () => {
  const oculta = campoSenha.type === "password";
  campoSenha.type = oculta ? "text" : "password";
  botaoMostrar.textContent = oculta ? "Ocultar" : "Mostrar";
  botaoMostrar.setAttribute("aria-pressed", String(oculta));
});

campoSenha.addEventListener("keydown", (e) => {
  if (e.key === "Enter") verificar();
});
botaoVerificar.addEventListener("click", verificar);

// SHA-1 no navegador (Web Crypto), em MAIÚSCULAS hexadecimal
async function sha1(texto) {
  const bytes = new TextEncoder().encode(texto); // UTF-8
  const hash = await crypto.subtle.digest("SHA-1", bytes);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

// Busca a lista de sufixos para o prefixo; usa o plano B se a API falhar.
async function buscarLista(prefixo) {
  try {
    const resp = await fetch("https://api.pwnedpasswords.com/range/" + prefixo);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    return { texto: await resp.text(), planoB: false };
  } catch (erro) {
    return { texto: RESPOSTAS_PRONTAS[prefixo] || "", planoB: true };
  }
}

// Procura o sufixo na lista (no navegador). Retorna a quantidade ou 0.
function contarVazamentos(lista, sufixo) {
  for (const linha of lista.split("\n")) {
    const [suf, qtd] = linha.trim().split(":");
    if (suf === sufixo) return parseInt(qtd, 10) || 0;
  }
  return 0;
}

// Nota de força: tamanho + tipos de caracteres
function avaliarForca(senha) {
  const n = [...senha].length;
  const tipos = [/[a-zà-ú]/, /[A-ZÀ-Ú]/, /[0-9]/, /[^a-zA-ZÀ-úÀ-Ú0-9]/]
    .filter((re) => re.test(senha)).length;

  let pontos = n >= 16 ? 3 : n >= 12 ? 2 : n >= 8 ? 1 : 0;
  if (tipos >= 3) pontos += 1;

  let nota = ["Muito fraca", "Fraca", "Média", "Forte", "Forte"][pontos];
  if (n < 8) nota = "Muito fraca";

  let detalhe = n + " caracteres";
  if (/^[0-9]+$/.test(senha)) detalhe += ", só números";
  else if (/^[a-zA-ZÀ-ú]+$/.test(senha)) detalhe += ", só letras";
  return nota + " (" + detalhe + ")";
}

function mostrar(estado, vazamento, forca, aviso) {
  areaResultado.hidden = false;
  areaResultado.dataset.estado = estado;
  msgVazamento.textContent = vazamento;
  msgForca.textContent = forca;
  msgAviso.textContent = aviso;
}

async function verificar() {
  const senha = campoSenha.value;

  if (senha === "") {
    mostrar("neutro", "Digite uma senha para verificar.", "", "");
    return; // nenhuma requisição é feita
  }

  botaoVerificar.disabled = true;
  try {
    const hash = await sha1(senha);
    const prefixo = hash.slice(0, 5); // só isto sai do navegador
    const sufixo = hash.slice(5);

    const { texto, planoB } = await buscarLista(prefixo);
    const vezes = contarVazamentos(texto, sufixo);
    const forca = "Força: " + avaliarForca(senha);
    const aviso = planoB
      ? "Não foi possível acessar a API. Resultado de demonstração, com poucas senhas conhecidas: não confie nele."
      : "";

    if (vezes > 0) {
      mostrar("vazou", "Essa senha já vazou " + vezes.toLocaleString("pt-BR") + " vezes. Não use.", forca, aviso);
    } else {
      mostrar("ok", "Não encontrada em vazamentos conhecidos.", forca, aviso);
    }
  } catch (erro) {
    mostrar("neutro", "Não foi possível verificar agora. Tente de novo em instantes.", "", "");
  } finally {
    botaoVerificar.disabled = false;
  }
}
