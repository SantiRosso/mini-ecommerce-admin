import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product } from '../../services/product.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="product-detail-container">
      <!-- Header con breadcrumbs -->
      <div class="detail-header">
        <nav class="breadcrumbs">
          <a routerLink="/" class="breadcrumb-link">
            <span class="icon">🏠</span>
            Dashboard
          </a>
          <span class="breadcrumb-separator">/</span>
          <a routerLink="/products" class="breadcrumb-link">
            <span class="icon">📦</span>
            Productos
          </a>
          <span class="breadcrumb-separator">/</span>
          <span class="breadcrumb-current">Detalle</span>
        </nav>

        <div class="header-actions">
          <button class="btn-secondary" (click)="goBack()">
            <span class="icon">←</span>
            Volver
          </button>
          <button class="btn-primary" (click)="editProduct()" *ngIf="product">
            <span class="icon">✏️</span>
            Editar
          </button>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="detail-content" *ngIf="!isLoading && product; else loadingOrErrorTemplate">
        <!-- Card principal del producto -->
        <div class="product-card">
          <div class="card-header">
            <div class="product-icon">📦</div>
            <div class="product-status">
              <span class="status-badge status-active">Activo</span>
            </div>
          </div>

          <div class="card-body">
            <h1 class="product-title">{{ product.name }}</h1>
            <div class="product-price">
              <span class="currency">$</span>
              <span class="amount">{{ product.price | number:'1.2-2' }}</span>
            </div>
          </div>
        </div>

        <!-- Grid de información detallada -->
        <div class="info-grid">
          <!-- Información básica -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="icon">ℹ️</span>
              Información Básica
            </h3>
            <div class="info-content">
              <div class="info-row">
                <span class="label">ID del Producto:</span>
                <span class="value">#{{ product.id }}</span>
              </div>
              <div class="info-row">
                <span class="label">Nombre:</span>
                <span class="value">{{ product.name }}</span>
              </div>
              <div class="info-row">
                <span class="label">Precio:</span>
                <span class="value price">\${{ product.price | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>

          <!-- Información de fechas -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="icon">📅</span>
              Fechas
            </h3>
            <div class="info-content">
              <div class="info-row">
                <span class="label">Fecha de Creación:</span>
                <span class="value">{{ formatDateTime(product.createdAt) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Última Actualización:</span>
                <span class="value">{{ formatDateTime(product.updatedAt) }}</span>
              </div>
              <div class="info-row">
                <span class="label">Días desde creación:</span>
                <span class="value">{{ getDaysFromCreation() }} días</span>
              </div>
            </div>
          </div>

          <!-- Estadísticas -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="icon">📊</span>
              Estadísticas
            </h3>
            <div class="info-content">
              <div class="info-row">
                <span class="label">Estado:</span>
                <span class="value">
                  <span class="status-indicator active"></span>
                  Disponible
                </span>
              </div>
              <div class="info-row">
                <span class="label">Categoría:</span>
                <span class="value">General</span>
              </div>
              <div class="info-row">
                <span class="label">Stock:</span>
                <span class="value">Ilimitado</span>
              </div>
            </div>
          </div>

          <!-- Acciones disponibles -->
          <div class="info-card">
            <h3 class="card-title">
              <span class="icon">⚡</span>
              Acciones Disponibles
            </h3>
            <div class="actions-content">
              <button class="action-btn edit" (click)="editProduct()">
                <span class="icon">✏️</span>
                <div class="action-text">
                  <span class="title">Editar Producto</span>
                  <span class="description">Modificar información del producto</span>
                </div>
              </button>
              
              <button class="action-btn duplicate" (click)="duplicateProduct()">
                <span class="icon">📋</span>
                <div class="action-text">
                  <span class="title">Duplicar Producto</span>
                  <span class="description">Crear una copia de este producto</span>
                </div>
              </button>
              
              <button class="action-btn delete" (click)="deleteProduct()">
                <span class="icon">🗑️</span>
                <div class="action-text">
                  <span class="title">Eliminar Producto</span>
                  <span class="description">Eliminar permanentemente</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Template para carga y errores -->
      <ng-template #loadingOrErrorTemplate>
        <div class="center-content">
          <div class="loading-state" *ngIf="isLoading">
            <div class="spinner"></div>
            <p>Cargando producto...</p>
          </div>
          
          <div class="error-state" *ngIf="!isLoading && !product">
            <div class="error-icon">❌</div>
            <h3>Producto no encontrado</h3>
            <p>El producto que buscas no existe o ha sido eliminado.</p>
            <button class="btn-primary" (click)="goBack()">
              <span class="icon">←</span>
              Volver al listado
            </button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .product-detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header */
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }

    .breadcrumbs {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    .breadcrumb-link {
      color: #6b7280;
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: color 0.2s ease;
    }

    .breadcrumb-link:hover {
      color: #3b82f6;
    }

    .breadcrumb-separator {
      color: #9ca3af;
    }

    .breadcrumb-current {
      color: #1f2937;
      font-weight: 600;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Buttons */
    .btn-primary, .btn-secondary {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background-color: #3b82f6;
      color: white;
    }

    .btn-primary:hover {
      background-color: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover {
      background-color: #e5e7eb;
    }

    /* Product Card */
    .product-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      margin-bottom: 32px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .product-icon {
      font-size: 3rem;
      opacity: 0.9;
    }

    .status-badge {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background-color: rgba(16, 185, 129, 0.2);
      color: #10b981;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .card-body {
      padding: 32px;
      text-align: center;
    }

    .product-title {
      margin: 0 0 16px 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .product-price {
      font-size: 2rem;
      font-weight: 700;
      color: #059669;
    }

    .currency {
      opacity: 0.7;
    }

    /* Info Grid */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }

    .info-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .card-title {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 20px 24px;
      margin: 0;
      background-color: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
    }

    .info-content {
      padding: 24px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .label {
      font-weight: 500;
      color: #6b7280;
    }

    .value {
      font-weight: 600;
      color: #1f2937;
    }

    .value.price {
      color: #059669;
      font-size: 1.1rem;
    }

    .status-indicator {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 8px;
    }

    .status-indicator.active {
      background-color: #10b981;
    }

    /* Actions Content */
    .actions-content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.2s ease;
      text-align: left;
    }

    .action-btn:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .action-btn.delete:hover {
      border-color: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
    }

    .action-btn .icon {
      font-size: 1.5rem;
    }

    .action-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .action-text .title {
      font-weight: 600;
      color: #1f2937;
    }

    .action-text .description {
      font-size: 14px;
      color: #6b7280;
    }

    /* Center Content */
    .center-content {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
    }

    .loading-state, .error-state {
      text-align: center;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-icon {
      font-size: 4rem;
      margin-bottom: 16px;
    }

    .error-state h3 {
      margin: 0 0 8px 0;
      color: #374151;
    }

    .error-state p {
      margin: 0 0 24px 0;
      color: #6b7280;
    }

    /* Icons */
    .icon {
      font-size: inherit;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .product-detail-container {
        padding: 16px;
      }

      .detail-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: flex-end;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .product-title {
        font-size: 2rem;
      }

      .breadcrumbs {
        flex-wrap: wrap;
      }
    }
  `]
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
      console.log('Edit product:', this.product);
      alert(`Editar producto: ${this.product.name} - Funcionalidad próximamente`);
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
