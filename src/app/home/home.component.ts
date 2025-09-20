import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../services/product.service';
import { UserService, User } from '../services/user.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  users: User[] = [];
  totalProducts: number = 0;
  totalUsers: number = 0;
  totalValue: number = 0;
  averagePrice: number = 0;
  recentProducts: Product[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.productService.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products = products;
        this.calculateStats();
        this.getRecentProducts();
      });

    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.totalUsers = users.length;
      });
  }

  private calculateStats(): void {
    this.totalProducts = this.products.length;
    this.totalValue = this.products.reduce((total, product) => total + product.price, 0);
    this.averagePrice = this.totalProducts > 0 ? this.totalValue / this.totalProducts : 0;
  }

  private getRecentProducts(): void {
    this.recentProducts = [...this.products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 3);
  }
}
