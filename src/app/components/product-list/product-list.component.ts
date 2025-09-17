import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.productService.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.products = products;
        this.filterProducts();
        this.isLoading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getTotalValue(): number {
    return this.products.reduce((total, product) => total + product.price, 0);
  }

  getAveragePrice(): number {
    if (this.products.length === 0) return 0;
    return this.getTotalValue() / this.products.length;
  }

  filterProducts(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = [...this.products];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.id.toString().includes(term)
      );
    }
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  }

  refreshProducts(): void {
    this.productService.loadProducts();
  }

  createProduct(): void {
    this.router.navigate(['/products/create']);
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/product', product.id]);
  }

  editProduct(product: Product): void {
    this.router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(product: Product): void {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`);
    if (confirmDelete) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          console.log('Product deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Error al eliminar el producto.');
        }
      });
    }
  }
}
