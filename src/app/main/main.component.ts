import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  
  countDownDate = new Date("Nov 26, 2021 23:59:59").getTime();
  
  constructor() { }

  ngOnInit(): void {
  }

  demo:any;
// Update the count down every 1 second
  x = setInterval(() => {

    var now = new Date().getTime();
    var distance = this.countDownDate - now;
      console.log(distance);
      console.log(this.countDownDate);
      console.log(now);
    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
    // Output the result in an element with id="demo"
    this.demo = { days, hours, minutes, seconds };
      
    // If the count down is over, write some text 
    if (distance < 0) {
      clearInterval(this.x);
      this.demo = "EXPIROU";
    }
  }, 1000);
}
