using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Web;

namespace PrintAPI.BotModels
{
    public class BotAdditional  //api/BotAdditional/{ProductCode}/{AddCode}      // api/BotAdditional/{ProductCode}
    {
        [Key]
        public int ID { get; set; }                 // (Primary Key) AutoIncrement * antigo Id - ID maiusculo para não confundir com Id do whatsapp*
        [DataType("ForeignKey da tabela BotProdutoPedido")] /* Tabela BotProdutoPedido mudou para BotProduct*/
        public required string ProductCode { get; set; }     // (Foreing Key) Codigo do produto ao qual este adicional pertence  (BUSCADOR 1) *antigo CodigoPedido*
        public virtual BotProducts? Products { get; set; }
        public int AddCode { get; set; }            // Codigo do adicional (BUSCADOR 2)  *novo*
        public string? nameAdd { get; set; }         // Nome do adicional *antigo Nome*
        public double priceAdd { get; set; }        // Preço do adicional *antigo preco*
        public string? categoryAdd { get; set; }     // Categoria do adicional   *novo*
        public bool enabledAdd { get; set; }        // Se esta ativo para uso ou não    *novo*
        public int? orderQtdAdd { get; set; }        // Quantidade desejada do produto pelo cliente    *novo*
        public int? qtdMinAdd { get; set; }          // Quantidade minima necessaria se esse adicional for adicionado    *novo*
        public int? qtdMaxAdd { get; set; }          // Quantidade maxima necessaria se esse adicional for adicionado    *novo*
    }
}