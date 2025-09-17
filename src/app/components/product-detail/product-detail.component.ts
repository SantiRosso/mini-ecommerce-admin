import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  isLoading: boolean = true;
  productId: number | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const id = +params['id'];
        if (id) {
          this.productId = id;
          this.loadProduct(id);
        } else {
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: number): void {
    this.isLoading = true;

    this.productService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.product = null;
          this.isLoading = false;
        }
      });
  }

  formatDateTime(dateString?: string): string {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  }

  getDaysFromCreation(): number {
    if (!this.product?.createdAt) return 0;

    try {
      const createdDate = new Date(this.product.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return 0;
    }
  }

  // Navigation methods
  goBack(): void {
    this.router.navigate(['/']);
  }

  // Action methods
  editProduct(): void {
    if (this.product) {
      console.log('Navigate to edit product:', this.product);
      this.router.navigate(['/products/edit', this.product.id]);
    }
  }

  duplicateProduct(): void {
    if (this.product) {
      console.log('Duplicate product:', this.product);
      alert(`Duplicar producto: ${this.product.name} - Funcionalidad próximamente`);
    }
  }

  deleteProduct(): void {
    if (!this.product) return;

    const confirmDelete = confirm(
      `¿Estás seguro de que quieres eliminar "${this.product.name}"?\n\nEsta acción no se puede deshacer.`
    );

    if (confirmDelete) {
      this.productService.deleteProduct(this.product.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('Product deleted successfully');
            alert('Producto eliminado exitosamente');
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
          }
        });
    }
  }
}
