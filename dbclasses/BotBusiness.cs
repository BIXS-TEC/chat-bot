using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace PrintAPI.Models
{
    public class BotBusiness
    {
        [Key]
        public int ID { get; set; }                         // (Primary Key) AutoIncrement      *novo*
        [DataType("ForeignKey da tabela Filial")]
        public int codFilial { get; set; }                  // (BUSCADOR 1) ID da Filial ao qual o bot pertence (Origem BD Retaguarda) (Foreing Key) *antigo IdFilial* 
                                                            // api/BotBusiness/{IdFilial}
        public virtual Filial? Filial { get; set; }
        public string nameBs { get; set; }                  // Nome do estabelecimento que vai aparecer no bot      *antigo name *
        public string FBTOKEN { get; set; }                 // Token de autorização do Facebook API
        public string botNumberID { get; set; }             // (BUSCADOR 1) Numero ID do bot para envio de mensagens
                                                            // api/BotBusiness/{botNumberID}
        public string botNumber { get; set; }               // Numero de telefone do bot
        public string botName { get; set; }                 // Nome do Bot/Assistente Virtual
        public ICollection<BotProduct>? productListBs { get; set; }// Lista de produtos da Filial  *novo*
        public ICollection<BotClient> clientListBs { get; set; }  // Lista de clientes cadastrados da Filial  *novo*
        public ICollection<BotArrayString> orderCodeList { get; set; }  // Lista de codigos de pedidos dos clientes  *novo*
        public int secondsToTimeOut { get; set; }             // Timeout para a mensagem ser ignorada
        public int showPrepTime { get; set; }                 // Enviar tempo de preparo do pedido ou não para o cliente
    }
}