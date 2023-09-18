function criar() {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var raw = JSON.stringify({
        "botNumberID": "113343625148900",
        "Name": "BIX Lanches",
        "FBTOKEN": "EAADawR0efmkBALFM4Xt1zVlDqyyQu4TS6jVDrENaqnYb5rN7VZBsfYivQkAKPWornKSN46tQ5L0UVABf5ggILKFXSOcVwItZA8MVtAIoZBGAhTI5wWhyGgnX9pU92BZAiDBkij2JnUuZBSKKPrjKB1cjfi21Pm9h1Hz4GUD1BdX7aMiYhW4usZATwJB3z4Yd3ZB3vCLB8NnSwZDZD",
        "IdFilial": 4,
        "botNumber": "15550107122"
    });
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        //redirect: 'follow'
    };
    fetch("http://lojas.vlks.com.br/api/BotBusiness/", requestOptions)
        .then(function (response) { return response.text(); })
        .then(function (result) { return console.log(result); })
        .catch(function (error) { return console.log('error', error); });
}
criar();
function buscarDados(botNumberID) {
    // URL da requisição GET
    var url = "http://lojas.vlks.com.br/api/BotBusiness?botNumberID=".concat(botNumberID);
    // Configurações da requisição
    var requestOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json' // Cabeçalhos da requisição
        }
    };
    // Realiza a requisição GET usando o fetch
    fetch(url, requestOptions)
        .then(function (response) { return response.json(); }) // Extrai o conteúdo JSON da resposta
        .then(function (data) { return console.log(data); }) // Mostra os dados da resposta no console
        .catch(function (error) { return console.log('error', error); }); // Mostra um erro no console se a requisição falhar
}
// Exemplo de uso da função
buscarDados('113343625148900');
//# sourceMappingURL=testereq.js.map