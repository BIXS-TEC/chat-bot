const regex = /^.+ #\w+:\d+ #ID:[a-zA-Z0-9]{5}$/;

// Exemplo de string que deve corresponder
const message = "Olá gostaria de ver as opções! #Mesa:5 #ID:318d5";

if (regex.test(message)) {
  console.log("A mensagem corresponde ao padrão.");
} else {
  console.log("A mensagem não corresponde ao padrão.");
}
