// Apenas para registrar o corpo da requisição para cada caso do endpoint startSession

//Primeira conexão
const startSession_notConnectedYet1 = {
    "status": "CLOSED",
    "qrcode": null,
    "session": ""
}

const statusSession_Initializing1 = {
    "status": "INITIALIZING",
    "qrcode": null,
    "version": "2.6.0"
}

const statusSession_QRCode = {
    "status": "QRCODE",
    "qrcode": "data:image/png;base64,iVBORw0KGgo...",
    "urlcode": "2@UJ1m8PoKMpefAFpsd6LGXHTz62+bxp...,0",
    "version": "2.6.0"
}


//Ja conectado anteriormente
const startSession_notConnectedYet = {
    "status": "CLOSED",
    "qrcode": null,
    "session": ""
}

const statusSession_Initializing = {
    "status": "INITIALIZING",
    "qrcode": null,
    "version": "2.6.0"
}

const statusSession_Connected = {
    "status": "CONNECTED",
    "qrcode": null,
    "version": "2.6.0"
};