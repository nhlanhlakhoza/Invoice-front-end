import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home1',
  templateUrl: './home1.component.html',
  styleUrl: './home1.component.css'
})
export class Home1Component 
{

  constructor(private router: Router) { }

  navigateToHome() {
    this.router.navigate(['/home']);
  }

}
