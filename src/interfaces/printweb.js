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

export function PrintWebDataToDefault(req) {
  throw new Error("Não foi possivel padronizar a requisição de PrintWeb!");
}
