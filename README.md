# Vazou? – verificador de senhas vazadas

Aplicação web em que a pessoa digita uma senha e descobre se ela já apareceu em vazamentos de dados conhecidos e quantas vezes, sem que a senha seja enviada a ninguém. Também dá uma nota simples de força.

**Disciplina:** Desenvolvimento de Sistemas Web (EECP0036) · UFMA · Engenharia da Computação · Turma 24N12
**Aluno:** Eduardo dos Santos Oliveira · **Matrícula:** 20260001295
**Trilha:** B (API pública)

## Tecnologias
- HTML, CSS e JavaScript puros, sem frameworks
- API pública [Pwned Passwords](https://haveibeenpwned.com/API/v3#PwnedPasswords) (Have I Been Pwned), gratuita e sem chave
- Web Crypto API (`crypto.subtle.digest`) para o hash SHA-1

## Como rodar
1. Baixe ou clone o repositório.
2. Abra a pasta no VS Code.
3. Clique com o botão direito em `index.html` e escolha **Open with Live Server**.

Não precisa instalar nada nem criar chave de API. É preciso de internet para consultar a API (veja o Plano B abaixo).

## Como funciona
1. O clique em **Verificar** lê o campo. Se estiver vazio, mostra o aviso "Digite uma senha para verificar." e nenhuma requisição é feita.
2. A senha vira bytes UTF-8 e o SHA-1 é gerado no navegador. O hash é dividido em prefixo (5 primeiros caracteres) e sufixo (resto).
3. O `fetch` faz GET em `https://api.pwnedpasswords.com/range/{prefixo}`. A resposta é um texto com linhas `SUFIXO:QUANTIDADE`.
4. O JavaScript procura o sufixo na lista, no próprio navegador, e escreve o resultado e a nota de força na página com `textContent`.

## O que o app faz
- Calcula o hash SHA-1 da senha no navegador
- Consulta a API usando só os 5 primeiros caracteres do hash (k-anonimato)
- Mostra se a senha vazou e quantas vezes
- Dá uma nota de força (tamanho e tipos de caracteres)
- Permite mostrar ou ocultar a senha digitada

## O que o app não faz
- Guardar ou enviar a senha (nem o hash completo)
- Ter login, conta ou banco de dados
- Gerar senhas ou verificar e-mails

## Exemplos de uso
| Entrada | Resultado |
|---|---|
| `123456` | "Essa senha já vazou ... vezes. Não use." (vermelho) + "Muito fraca (6 caracteres, só números)" |
| `cavalo-bateria-grampo-2026` | "Não encontrada em vazamentos conhecidos." (verde) + "Forte (26 caracteres)" |
| campo vazio | "Digite uma senha para verificar." |

## Cuidados
- **Privacidade:** só o prefixo de 5 caracteres do hash sai do navegador. O campo usa `type="password"`, e a senha não é salva em `localStorage` nem escrita no console. A tela avisa para testar senhas parecidas, não as de contas importantes.
- **Entrada inesperada e falhas:** acentos e emojis são tratados como UTF-8. `try/catch` e checagem do status HTTP mostram mensagem amigável e ativam o plano B. Todo texto vai para a página com `textContent`, nunca `innerHTML`.

## Plano B (sem internet ou API fora do ar)
Se a requisição falhar, o app usa o arquivo `fallback.js`, que tem respostas prontas, no mesmo formato da API, para apenas dois prefixos (senhas `123456` e `password`). **As quantidades desse arquivo são aproximadas e servem só para demonstração.** Nesse modo, a tela avisa que o resultado é de demonstração.

## Estrutura do projeto
```
index.html    página
style.css     estilos
script.js     lógica (hash, API, resultado, nota de força)
fallback.js   respostas prontas do plano B
README.md     este arquivo
```

## Uso de IA
Ferramenta: **Claude (Anthropic)**.

- **O que pedi:** sugestão do tema, ajuda para redigir a proposta (Etapa 1) e a primeira versão do código e do README (Etapa 2).
- **O que revisei e alterei:** revisei o uso da API Pwned Passwords e testei várias senhas (fracas, fortes, com acentos e com o campo vazio) para conferir se o resultado e a nota de força faziam sentido. Também estudei o código JavaScript para entender como funciona: o cálculo do hash SHA-1 com a Web Crypto API, o envio só dos 5 primeiros caracteres ao `fetch` e a busca do sufixo na resposta, feita no navegador.

## Créditos
API Pwned Passwords, de Troy Hunt (Have I Been Pwned).