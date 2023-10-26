using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace PrintAPI.Models
{
    public class BotClient  
    {
        [Key]
        public int ID { get; set; }                         // (Primary Key) AutoIncrement
        [DataType("ForeignKey da tabela BotBusiness")]
        public int BotBusinessID { get; set; }              // ForeignKey da tabela BotBusiness
        public string botNumberID { get; set; }             // (Buscador 1) Numero ID do bot associoado ao cliente
                                                            // Link GET: api/BotClient/{botNumberID}
        public string orderCodeClient { get; set; }         // (Buscador 2) Codigo do pedido/comanda do cliente
                                                            // Link GET: api/BotClient/{botNumberID}/orderCodeClient={orderCodeClient}
        public string phoneNumberClient { get; set; }       // (Buscador 3) Numero de celular do cliente
                                                            // Link GET: api/BotClient/{botNumberID}/phoneNumberClient={phoneNumberClient}
        public string nameClient { get; set; }              // Nome perfil do WA do cliente
        public string? contextClient { get; set; }           // Contexto atual do cliente em relação ao fluxo da conversa
        public string? addressClient {get; set;}             // Logadouro cadastrado pelo cliente
        public string? cpf_cnpjClient {get; set;}            // CPF ou CNPJ fornecido pelo cliente
        public int? currentProductIndex { get; set; }        // Produto atual selecionado pelo cliente
        public int? tableClient { get; set; }                // Mesa atual do cliente
        public double? totalOrderPrice { get; set; }         // Total do valor do pedido do cliente
        public string? editingOrder { get; set; }            // Esta editando o pedido ou não
        public string? orderMessageId { get; set; }          // ID da ultima mensagem da lista de pedidos enviada para o cliente
        public ICollection<BotArrayString> chatHistory { get; set; } // Historico de mensagens de texto do cliente
        public ICollection<BotProductClient> ProductListClient { get; set; }  // Lista de produtos pedidos pelo cliente
    }
}