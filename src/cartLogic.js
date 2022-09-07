module.exports = function Cart(prijasnjaKosarica) {
    this.proizvodi = prijasnjaKosarica.proizvodi || {};
    this.ukupnaKol = prijasnjaKosarica.ukupnaKol || 0;
    this.ukupnaCijena = prijasnjaKosarica.ukupnaCijena || 0.00;
  
    this.dodajPice = function(proizvod) {
      let spremiProizvod = this.proizvodi;
      if (!spremiProizvod.hasOwnProperty("proizvod")) {
        
        spremiProizvod = this.proizvodi = {proizvod: proizvod};
        this.ukupnaKol = 1;
        this.ukupnaCijena = parseFloat(proizvod.cijena);
  
      } else {
          spremiProizvod = {proizvod: proizvod};
          this.proizvodi = spremiProizvod;
          spremiProizvod.cijena = parseFloat(spremiProizvod.proizvod.cijena * spremiProizvod.kolicinaTrenutnogPr);
      
        this.ukupnaKol++;
        this.ukupnaCijena += parseFloat(spremiProizvod.proizvod.cijena);
      }
    }
  }
  