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
        public int ID { get; set; }
        [DataType("ForeignKey da tabela Filial")]
        /*Buscador 1 api/BotBusiness/codFilial={codFilial}*/
        public int codFilial { get; set; }
        public virtual Filial? Filial { get; set; }
        public string name { get; set; }
        public string FBTOKEN { get; set; }
        /*Buscador 1 api/BotBusiness/botNumberID={botNumberID}*/
        public string botNumberID { get; set; }
        public string botNumber { get; set; }
        public string botName { get; set; }
        public int secondsToTimeOut { get; set; }
        public bool showPrepTime { get; set; }
        public bool showPrice { get; set; }
        public string menuLink { get; set; }
        public ICollection<BotProduct>? productList { get; set; }
        public ICollection<BotClient> clientList { get; set; }
        public ICollection<BotArrayString> orderCodeList { get; set; }
        
    }
}