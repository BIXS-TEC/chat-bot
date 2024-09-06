NOTA: Para iniciar uma sessão no chatbot utilizando o Gerenciador Assistente Bix é necessário reiniciar o servidor (as vezes 2, 3 vezes) por não ter um tratamento de sessões implementado e dar refresh no site antes de clicar em "Conectar Dispositivo".
Estará pronto para conexão se o servidor loggar no console:
0|server | Path to chatbot: https://localhost:5002/message
1|wpp-server  | (node:19845) [DEP0040] DeprecationWarning: The `punycode` module is deprecated. Please use a userland alternative instead.
1|wpp-server  | (Use `node --trace-deprecation ...` to show where the warning was created)
1|wpp-server  | info: 2024-09-06T18:30:35.164Z Server is running on port: 5001
1|wpp-server  | info: 2024-09-06T18:30:35.169Z  Visit 3.138.64.201:5001/api-docs for Swagger docs
1|wpp-server  | info: 2024-09-06T18:30:35.171Z WPPConnect-Server version: 2.6.0


------------ PRODUÇÃO ------------
* Acessar a instancia EC2 via SSH

1.Abra o prompt de comando

2.Insira o comando com o caminho para a chave de acesso
- ssh -i "[caminho-para-chave].pem" ubuntu@ec2-54-227-229-46.compute-1.amazonaws.com
- responda com "y" a autorização

3.Acesse o diretório do chat-bot
- cd chat-bot

Nota: Para executar os dois servidores de forma simultanea é utilizado o pm2, que já esta instalado. Consulte a documentação do pm2 para mais detalhes

4.Iniciar o chatbot-server usando o pm2 use o script npm (configurado em package.json)
- npm run pm2svr
OU
- pm2 start server.js

5.Iniciar o wppconnect-server usando o pm2 use o script npm (configurado em package.json)
- npm run pm2wpp
OU
- pm2 start wpp-server.js

6.Visualizar as saídas utilize o comando
- pm2 logs
OU 
- pm2 logs --lines 100 (mostrar ultimas 100 linhas)

7(Opcional).Utilize os 3 comandos simultaneamente
- npm run pm2svr | npm run pm2wpp | pm2 logs

8.Atualizar os arquivos com a branch wppconnect do github/BIXS-TEC e reiniciar o server utilize o comando:
- npm run update
Nota: Se o diretorio estiver privado, deve ser configurado um access token
("git fetch && git reset --hard origin/wppconnect && pm2 restart server")

9.Listar os servidores em execução no pm2
- pm2 list

10.Reiniciar os servidores utilizando o pm2
- pm2 restart [nome/numero do servidor] (ex: pm2 restart 0)
OU
- pm2 restart 0 | pm2 restart 1 | pm2 logs

11.Parar a execução do servidor 
- pm2 stop [nome/numero do servidor]

12.Alterar arquivos 
node_modules\@wppconnect\server\dist\util\createSessionUtil.js 
e
node_modules\@wppconnect\server\dist\config.js 
copiando dos arquivos em test\config\
- npm run postinstall


------------ DESENVOLVIMENTO ------------
1.Executar chatbot-server localmente
- npm run dev

2.Executar wppconnect-server localmente
- npm run devwpp

(DEV) LEGENDA PARA LOGS:

Texto vermelho : Erros de tipo ou estrutura de dados
Texto verde
Texto amarelo
Texto azul
Texto magenta : Erros de configuração lógica
Texto ciano
Texto branco
Texto em negrito
Texto sublinhado
Texto com inversão

# TO DO
1. Conexão com banco de dados
2. Fila de requisições para espera em caso de inatividade do sistema
3. Bearer Token de Autentificação para API
4. Criar classes para product e additional
5. Tornar WhatsApp 100% independente
6. Init do bot pela conversa com proprio numero
7. Data Source produtos via excel
8. Registrar produtos na loja do WhatsApp