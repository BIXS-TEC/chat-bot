import Business from './business';
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
export class Controller {
    constructor() {
        this.businessList = {};
        this.businessList[WHATSAPP_BUSINESS_ACCOUNT_ID] = new Business(WHATSAPP_BUSINESS_ACCOUNT_ID);
    }
    /**
     * Identifica o negócio correspondente e trata a requisição
     * @param req Requisição
     * @param res Resposta
     */
    accessBusiness(req, res) {
        if (req.body &&
            req.body.entry &&
            req.body.entry[0] &&
            req.body.entry[0].changes &&
            req.body.entry[0].changes[0] &&
            req.body.entry[0].changes[0].value &&
            req.body.entry[0].changes[0].value.metadata &&
            req.body.entry[0].changes[0].value.metadata.phone_number_id) {
            const phone_number_id = req.body.entry[0].changes[0].value.metadata.phone_number_id;
            if (this.businessList[phone_number_id]) {
                this.businessList[phone_number_id].postRequest(req, res);
            }
            else {
                console.error("\x1b[31m%s\x1b[0m", `Business ${phone_number_id} não existe!`);
            }
        }
        else if (req.body &&
            req.body.business &&
            req.body.business.businessId) {
            const businessId = req.body.business.businessId;
            if (this.businessList[businessId]) {
                this.updateBusinessData(req.body.business);
            }
            else {
                console.error("\x1b[31m%s\x1b[0m", `Business ${businessId} não existe!`);
            }
        }
    }
    /**
     *
     * @param business = {
     * businessId: ID do negócio;
     * updateData: Lista de parametros especificos a serem atualizados, se [''] altera todos os parametros;
     * }
     */
    updateBusinessData(business) {
        this.businessList[business.businessId].initializeBusinessData();
    }
    /**
     * Verifica se o negócio associado ao businessId, existe
     * @param businessId: ID do negócio
     * @returns boolean
     */
    businessExist(businessId) {
        if (this.businessList[businessId]) {
            return true;
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=controller.js.map