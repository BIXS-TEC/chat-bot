export interface BotAdditional {
    ID?: number; // Primary Key autoincrement
    ProductCode?: number; // Buscador 1
    codeAdd?: string; // Buscador 2
    nameAdd?: string;
    priceAdd?: number;
    qtdMinAdd?: number;
    qtdMaxAdd?: number;
    categoryAdd?: string;
    enabledAdd?: boolean;
    orderQtdAdd?: number;
    selectedAdd?: boolean;
    ProductsID?: string;
}

export interface BotProduct {
    ID?: number; // Primary Key autoincrement
    botNumberID?: string; // Buscador 1
    IdClient?: number;
    codeProd: string; // Buscador 2
    nameProd: string;
    priceProd: number;
    imageUrlProd?: string;
    categoryProd?: string;
    orderQtdProd?: number;
    qtdStockProd?: number;
    descriptionProd?: string;
    observationClient?: string;
    preparationTime?: number;
    quickResale?: boolean;
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
    cpf_cnpjClient ?: string;
    currentProductIndex?: number;
    tableClient?: number;
    orderMessageId?: string;
    totalOrderPrice?: number;
    editingOrder?: boolean;
    recommendedProduct?: RecommendProduct;
    errorQtdAdd?: number;
    timeoutID?: NodeJS.Timeout;
    chatHistory: string[];
    BotBusinessID?: number;
    ProductListClient: BotProduct[];
    fullAdditionalList?: any[];
}

export interface RecommendProduct {
    count: number;
    recCodeProd: string;    // Recommended code product
    refCodeProd: string;    // Referenced code product
}

export interface BotArrayString {
    Id?: number,
    texto: string,
    botNumberID?: string,
    BotBusinessID?: number,
    BotClientID?: number
  }