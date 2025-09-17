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
  selectedSort: string = '';
  selectedPriceRange: string = '';
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

  getMostExpensiveProduct(): Product | undefined {
    return this.products.reduce((max, product) =>
      product.price > (max?.price || 0) ? product : max,
      undefined as Product | undefined
    );
  }

  filterProducts(): void {
    let filtered = [...this.products];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.id.toString().includes(term)
      );
    }

    // Filter by price range
    if (this.selectedPriceRange) {
      const [min, max] = this.selectedPriceRange.split('-').map(v => v.replace('+', ''));
      filtered = filtered.filter(product => {
        if (this.selectedPriceRange === '200+') {
          return product.price >= 200;
        }
        return product.price >= parseFloat(min) && product.price <= parseFloat(max);
      });
    }

    // Sort products
    if (this.selectedSort) {
      switch (this.selectedSort) {
        case 'name-asc':
          filtered.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'name-desc':
          filtered.sort((a, b) => b.name.localeCompare(a.name));
          break;
        case 'price-asc':
          filtered.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filtered.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          filtered.sort((a, b) =>
            new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
          );
          break;
      }
    }

    this.filteredProducts = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedSort = '';
    this.selectedPriceRange = '';
    this.filterProducts();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedSort || this.selectedPriceRange);
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

  duplicateProduct(product: Product): void {
    console.log('Duplicate product:', product);
    alert(`Duplicar producto: ${product.name} - Funcionalidad próximamente`);
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
