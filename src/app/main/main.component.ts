import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  
  DataLimite = new Date("Nov 26, 2021 23:59:59").getTime();
  
  constructor() { }

  ngOnInit(): void {
  }

  demo:any;

  x = setInterval(() => {

    var agora = new Date().getTime();
    var restante = this.DataLimite - agora;
      console.log(restante);
      console.log(this.DataLimite);
      console.log(agora);

    let dias = Math.floor(restante / (1000 * 60 * 60 * 24));
    let horas = Math.floor((restante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutos = Math.floor((restante % (1000 * 60 * 60)) / (1000 * 60));
    let segundos = Math.floor((restante % (1000 * 60)) / 1000);
      
    this.demo = { dias, horas, minutos, segundos };
      
   if (restante < 0) {
      clearInterval(this.x);
      this.demo = "EXPIROU";
    }
  }, 1000);
}
