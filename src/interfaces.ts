export interface BotAdditional {
    ID?: number; // Primary Key autoincrement
    ProductCode?: number; // Buscador 1
    AddCode?: string; // Buscador 2
    nameAdd?: string;
    priceAdd?: number;
    qtdMinAdd?: number;
    qtdMaxAdd?: number;
    categoryAdd?: string;
    enabledAdd?: boolean;
    orderQtdAdd?: number;
}

export interface BotProduct {
    ID?: number; // Primary Key autoincrement
    botNumberID?: string; // Buscador 1
    codeProd: string; // Buscador 2
    nameProd: string;
    priceProd: number;
    imageProdUrl?: string;
    categoryProd?: string;
    orderQtdProd?: number;
    qtdStockProd?: number;
    descriptionProd?: string;
    observationClient?: string;
    preparationTime?: number;
    qtdMaxAdditionals?: number;
    qtdMinAdditionals?: number;
    recommendedProductCode?: string;
    AdditionalList: Record<string, BotAdditional>;
}

export interface BotClient {
    ID?: number; // Primary Key autoincrement
    botNumberID?: string; // Buscador 1
    orderCodeClient: string; // Buscador 2
    nameClient: string;
    phoneNumberClient: string; 
    contextClient: string;
    addressClient?: string;
    textMessage?: string;
    currentProductIndex?: number;
    tableClient?: number;
    orderMessageId?: string;
    totalOrderPrice?: number;
    editingOrder?: boolean;
    recomendedProduct?: any;
    errorQtdAdd?: number;
    chatHistory: string[];
    productListClient: BotProduct[];
    fullAdditionalList?: any[];
}