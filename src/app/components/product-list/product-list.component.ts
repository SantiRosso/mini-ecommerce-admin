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
  template: `
    <div class="product-list-container">
      <!-- Header -->
      <div class="list-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="icon">📦</span>
            Gestión de Productos
          </h1>
          <p class="page-subtitle">Administra el inventario de tu tienda</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="refreshProducts()">
            <span class="icon">🔄</span>
            Actualizar
          </button>
          <button class="btn-success" (click)="createProduct()">
            <span class="icon">➕</span>
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ products.length }}</h3>
            <p>Total Productos</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>\${{ getTotalValue() | number:'1.2-2' }}</h3>
            <p>Valor Total</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>\${{ getAveragePrice() | number:'1.2-2' }}</h3>
            <p>Precio Promedio</p>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="table-container" *ngIf="!isLoading; else loadingTemplate">
        <div class="table-header">
          <h2>Lista de Productos</h2>
          <div class="table-filters">
            <input
              type="text"
              placeholder="Buscar productos..."
              class="search-input"
              [(ngModel)]="searchTerm"
              (input)="filterProducts()">
          </div>
        </div>

        <div class="table-wrapper" *ngIf="filteredProducts.length > 0; else emptyTemplate">
          <table class="products-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Fecha Creación</th>
                <th>Última Actualización</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of filteredProducts; trackBy: trackByProductId">
                <td class="id-cell">
                  <span class="product-id">#{{ product.id }}</span>
                </td>
                <td class="name-cell">
                  <div class="product-name">
                    <span class="name">{{ product.name }}</span>
                  </div>
                </td>
                <td class="price-cell">
                  <span class="price">\${{ product.price | number:'1.2-2' }}</span>
                </td>
                <td class="date-cell">
                  <span class="date">{{ formatDate(product.createdAt) }}</span>
                </td>
                <td class="date-cell">
                  <span class="date">{{ formatDate(product.updatedAt) }}</span>
                </td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button
                      class="btn-action btn-view"
                      (click)="viewProduct(product)"
                      title="Ver detalles">
                      <span class="icon">👁️</span>
                    </button>
                    <button
                      class="btn-action btn-edit"
                      (click)="editProduct(product)"
                      title="Editar producto">
                      <span class="icon">✏️</span>
                    </button>
                    <button
                      class="btn-action btn-delete"
                      (click)="deleteProduct(product)"
                      title="Eliminar producto">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #emptyTemplate>
          <div class="empty-state">
            <div class="empty-icon">📦</div>
            <h3>No se encontraron productos</h3>
            <p *ngIf="searchTerm">No hay productos que coincidan con "{{ searchTerm }}"</p>
            <p *ngIf="!searchTerm">Aún no hay productos creados</p>
            <button class="btn-primary" (click)="createProduct()">
              <span class="icon">➕</span>
              Crear Primer Producto
            </button>
          </div>
        </ng-template>
      </div>

      <ng-template #loadingTemplate>
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .product-list-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header */
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e7eb;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .page-subtitle {
      margin: 0;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Buttons */
    .btn-primary, .btn-success {
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

    .btn-success {
      background-color: #10b981;
      color: white;
    }

    .btn-success:hover {
      background-color: #059669;
      transform: translateY(-1px);
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      font-size: 2.5rem;
      opacity: 0.8;
    }

    .stat-content h3 {
      margin: 0 0 4px 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-content p {
      margin: 0;
      color: #6b7280;
      font-weight: 500;
    }

    /* Table Container */
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .table-header {
      padding: 24px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
    }

    .search-input {
      padding: 10px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      min-width: 250px;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    /* Table */
    .table-wrapper {
      overflow-x: auto;
    }

    .products-table {
      width: 100%;
      border-collapse: collapse;
    }

    .products-table th,
    .products-table td {
      padding: 16px;
      text-align: left;
      border-bottom: 1px solid #f3f4f6;
    }

    .products-table th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .products-table tbody tr:hover {
      background-color: #f9fafb;
    }

    /* Table Cells */
    .id-cell {
      width: 80px;
    }

    .product-id {
      font-family: monospace;
      font-weight: 600;
      color: #6b7280;
    }

    .name-cell {
      min-width: 200px;
    }

    .product-name .name {
      font-weight: 600;
      color: #1f2937;
    }

    .price-cell {
      width: 120px;
    }

    .price {
      font-weight: 700;
      color: #059669;
      font-size: 16px;
    }

    .date-cell {
      width: 150px;
      font-size: 14px;
      color: #6b7280;
    }

    .actions-cell {
      width: 140px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .btn-action {
      padding: 8px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-view {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-view:hover {
      background-color: #e5e7eb;
    }

    .btn-edit {
      background-color: #fef3c7;
      color: #d97706;
    }

    .btn-edit:hover {
      background-color: #fde68a;
    }

    .btn-delete {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .btn-delete:hover {
      background-color: #fecaca;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 80px 20px;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state h3 {
      margin: 0 0 8px 0;
      color: #374151;
    }

    .empty-state p {
      margin: 0 0 24px 0;
      color: #6b7280;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 80px 20px;
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

    .loading-state p {
      color: #6b7280;
      font-size: 16px;
    }

    /* Icons */
    .icon {
      font-size: inherit;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .product-list-container {
        padding: 16px;
      }

      .list-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: flex-end;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .table-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .search-input {
        min-width: auto;
        width: 100%;
      }

      .action-buttons {
        flex-direction: column;
        gap: 4px;
      }
    }
  `]
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';
  isLoading: boolean = true;


  private destroy$ = new Subject<void>();

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(): void {
    this.isLoading = true;

    // Suscribirse al observable de productos del servicio
    this.productService.products$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products = products;
          this.filterProducts();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
        }
      });
  }

  refreshProducts(): void {
    this.productService.loadProducts();
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

  getTotalValue(): number {
    return this.products.reduce((total, product) => total + product.price, 0);
  }

  getAveragePrice(): number {
    if (this.products.length === 0) return 0;
    return this.getTotalValue() / this.products.length;
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

  // Actions
  createProduct(): void {
    console.log('Navigate to create product form');
    this.router.navigate(['/products/create']);
  }

  viewProduct(product: Product): void {
    console.log('View product:', product);
    // Abrir en nueva pestaña
    const url = this.router.serializeUrl(
      this.router.createUrlTree(['/product', product.id])
    );
    window.open(url, '_blank');
  }

  editProduct(product: Product): void {
    console.log('Navigate to edit product:', product);
    this.router.navigate(['/products/edit', product.id]);
  }

  deleteProduct(product: Product): void {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`);

    if (confirmDelete) {
      this.productService.deleteProduct(product.id).subscribe({
        next: () => {
          console.log('Product deleted successfully');
          // La lista se actualizará automáticamente gracias al observable
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Error al eliminar el producto. Por favor, intenta de nuevo.');
        }
      });
    }
  }
}
