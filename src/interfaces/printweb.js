const pwInterface = {};
export default pwInterface;

/** Standard printweb income structure
 * {
 *  "plataform": "printweb"
 *  "message": {
 *      "id" : number,
        "name" : string,
        "phoneNumber" : string,
        "chatbotPhoneNumber" : request.chatbotPhoneNumber,
        "message" : request.message
 *  }
 * }
 */

pwInterface.PrintWebConfigToDefault = function(req) {
  throw new Error("Não foi possivel padronizar a requisição de PrintWeb!");
}
