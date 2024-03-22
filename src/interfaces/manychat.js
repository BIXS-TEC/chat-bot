/** Standard manychat income structure
 * {
 *  "plataform": "manychat"
 *  "message": {
 *      "id" : number,
        "name" : string,
        "phoneNumber" : string,
        "chatbotPhoneNumber" : request.chatbotPhoneNumber,
        "message" : request.message
 *  }
 * }
 */

export function ManychatRequestToDefault(req) {
  throw new Error("Não foi possivel padronizar a requisição de Manychat!");
}
