using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace PrintAPI.Models
{
    public class ArrayString 
    {
        [Key]
        public int ID { get; set; }         // (Primary Key) AutoIncrement      *novo*
        public string text { get; set; }
    }
}