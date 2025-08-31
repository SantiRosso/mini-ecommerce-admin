import { Component } from '@angular/core';
import { ProductListComponent } from '../components/product-list/product-list.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ProductListComponent],
  template: `
    <div class="home-container">
      <app-product-list></app-product-list>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background-color: #f9fafb;
    }
  `]
})
export class HomeComponent {}
