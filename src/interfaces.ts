export interface BotAdditional {
    ID?: number; // Primary Key autoincrement
    ProductCode?: number; // Buscador 1
    AddCode?: string; // Buscador 2
    nameAdd?: string;
    priceAdd?: number;
    categoryAdd?: string;
    enabledAdd?: boolean;
    orderQtdAdd?: number;
    qtdMinAdd?: number;
    qtdMaxAdd?: number;
}

export interface BotProduct {
    ID?: number; // Primary Key autoincrement
    botNumberID?: string; // Buscador 1
    codeProd: string; // Buscador 2
    nameProd: string;
    priceProd: number;
    categoryProd?: string;
    orderQtdProd?: number;
    qtdStockProd?: number;
    descriptionProd?: string;
    observationProd?: string;
    preparationTime?: number;
    qtdMaxAdditionals?: number;
    qtdMinAdditionals?: number;
    previewAdditionals?: boolean;
    AdditionalList: BotAdditional[];
}

export interface BotClient {
    ID?: number; // Primary Key autoincrement
    botNumberID?: string; // Buscador 1
    orderCodeClient: string; // Buscador 2
    phoneNumberClient: string; 
    nameClient: string;
    contextClient: string;
    addressClient?: string;
    currentProductIndex?: number;
    tableClient?: number;
    orderMessageId?: string;
    totalOrderPrice?: number;
    editingOrder?: boolean;
    chatHistory: string[];
    productListClient: BotProduct[];
}