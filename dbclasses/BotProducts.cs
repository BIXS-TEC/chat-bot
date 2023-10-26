using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace PrintAPI.Models
{
    public class BotProducts
    {
        public int ID { get; set; }                         // (Primary Key) autoincrement
        public string botNumberID { get; set; }             // Numero ID do bot (Buscador 1)
        public virtual BotBusiness? BotBusiness { get; set; }
        [DataType("ForeignKey da tabela BotBusiness")]
        public int BotBusinessID { get; set; }              // ForeignKey da tabela BotBusiness
        public required int IdClient { get; set; }          // Codigo do cliente (Buscador 2)
                                                            // api/BotProducts/{botNumberID}/{IdClient}
        public BotClient? BotClient { get; set; }
        public int codeProd { get; set; }                   // Codigo do produto(Buscador 2)
                                                            // api/BotProducts/{botNumberID}/{codeProd}
        public string? nameProd { get; set; }               // Nome do produto
        public float priceProd { get; set; }                // Preço do produto
        public string? imageUrlProd { get; set; }           // Link para imagem do produto para exibição
        public string? categoryProd { get; set; }           // Categoria do produto
        public int? orderQtdProd { get; set; }              // Quantidade desejada do produto pelo cliente
        public int? qtdStockProd { get; set; }              // Quantidade do produto em estoque
        public string? descriptionProd { get; set; }        // Descrição do produto
        public string? observationClient { get; set; }      // Observação do cliente para o pedido ++ nome alterado
        public string? recommendedProductCode { get; set; } // Produto que seja relacionado, para indicação de venda casada
        public int? preparationTime { get; set; }           // Tempo de preparo do produto pelo estabelecimento
        public int? qtdMaxAdditionals { get; set; }         // Quantidade maxima de adicionais que podem ser incluidos
        public int? qtdMinAdditionals { get; set; }         // Quantidade mínima de adicionais que podem ser incluidos
        public bool? previewAdditionals { get; set; }       // Visualizar ou não previa dos adicionais na mensagem do Bot
        public ICollection<BotAdditional>? AdditionalList { get; set; } // Lista de adicionais relacionados ao produto

    }
}