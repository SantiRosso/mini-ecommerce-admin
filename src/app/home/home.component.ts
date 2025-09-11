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
  template: `
    <div class="home-container">
      <!-- Welcome Header -->
      <div class="welcome-section">
        <div class="welcome-content">
          <h1 class="welcome-title">
            <span class="welcome-icon">👋</span>
            ¡Bienvenido al Dashboard de Administración!
          </h1>
          <p class="welcome-subtitle">
            Gestiona tu tienda de manera eficiente desde un solo lugar
          </p>
        </div>
        <div class="welcome-actions">
          <button class="btn-primary" routerLink="/products/create">
            <span class="icon">➕</span>
            Crear Producto
          </button>
          <button class="btn-secondary" routerLink="/products">
            <span class="icon">📦</span>
            Ver Productos
          </button>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="stats-section">
        <h2 class="section-title">
          <span class="icon">📊</span>
          Resumen General
        </h2>

        <div class="stats-grid">
          <div class="stat-card products">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <h3 class="stat-number">{{ totalProducts }}</h3>
              <p class="stat-label">Total Productos</p>
              <a routerLink="/products" class="stat-link">Ver todos →</a>
            </div>
          </div>

          <div class="stat-card revenue">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <h3 class="stat-number">\${{ totalValue | number:'1.2-2' }}</h3>
              <p class="stat-label">Valor Total Inventario</p>
              <span class="stat-link">En productos</span>
            </div>
          </div>

          <div class="stat-card average">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <h3 class="stat-number">\${{ averagePrice | number:'1.2-2' }}</h3>
              <p class="stat-label">Precio Promedio</p>
              <span class="stat-link">Por producto</span>
            </div>
          </div>

          <div class="stat-card users">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
              <h3 class="stat-number">{{ totalUsers }}</h3>
              <p class="stat-label">Usuarios</p>
              <a routerLink="/users" class="stat-link">Ver todos →</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <h2 class="section-title">
          <span class="icon">⚡</span>
          Acciones Rápidas
        </h2>

        <div class="actions-grid">
          <div class="action-card" routerLink="/products/create">
            <div class="action-icon">➕</div>
            <div class="action-content">
              <h3>Crear Producto</h3>
              <p>Agrega un nuevo producto al inventario</p>
            </div>
            <div class="action-arrow">→</div>
          </div>

          <div class="action-card" routerLink="/products">
            <div class="action-icon">📋</div>
            <div class="action-content">
              <h3>Gestionar Productos</h3>
              <p>Ver, editar y eliminar productos existentes</p>
            </div>
            <div class="action-arrow">→</div>
          </div>

          <div class="action-card" routerLink="/users">
            <div class="action-icon">👥</div>
            <div class="action-content">
              <h3>Gestionar Usuarios</h3>
              <p>Administrar cuentas y permisos de usuario</p>
            </div>
            <div class="action-arrow">→</div>
          </div>

          <div class="action-card disabled">
            <div class="action-icon">📊</div>
            <div class="action-content">
              <h3>Ver Reportes</h3>
              <p>Analizar ventas y rendimiento del negocio</p>
            </div>
            <div class="action-arrow">→</div>
            <div class="coming-soon-badge">Próximamente</div>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="activity-section" *ngIf="recentProducts.length > 0">
        <h2 class="section-title">
          <span class="icon">🕒</span>
          Productos Recientes
        </h2>

        <div class="recent-products">
          <div class="product-item" *ngFor="let product of recentProducts">
            <div class="product-icon">📦</div>
            <div class="product-info">
              <h4>{{ product.name }}</h4>
              <p>\${{ product.price | number:'1.2-2' }}</p>
            </div>
            <div class="product-actions">
              <button class="btn-small" [routerLink]="['/product', product.id]">
                Ver
              </button>
              <button class="btn-small" [routerLink]="['/products/edit', product.id]">
                Editar
              </button>
            </div>
          </div>
        </div>

        <div class="view-all-products">
          <button class="btn-outline" routerLink="/products">
            Ver todos los productos
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background-color: #f9fafb;
      padding: 32px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Welcome Section */
    .welcome-section {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 48px;
      color: white;
      margin-bottom: 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);
    }

    .welcome-content h1 {
      font-size: 2.5rem;
      margin: 0 0 12px 0;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .welcome-icon {
      font-size: 3rem;
    }

    .welcome-subtitle {
      font-size: 1.2rem;
      margin: 0;
      opacity: 0.9;
    }

    .welcome-actions {
      display: flex;
      gap: 16px;
    }

    /* Buttons */
    .btn-primary, .btn-secondary, .btn-outline, .btn-small {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      font-size: 1rem;
    }

    .btn-primary {
      background-color: #fbbf24;
      color: #1f2937;
    }

    .btn-primary:hover {
      background-color: #f59e0b;
      transform: translateY(-2px);
    }

    .btn-secondary {
      background-color: rgba(255, 255, 255, 0.2);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .btn-secondary:hover {
      background-color: rgba(255, 255, 255, 0.3);
    }

    .btn-outline {
      background-color: transparent;
      color: #3b82f6;
      border: 2px solid #3b82f6;
    }

    .btn-outline:hover {
      background-color: #3b82f6;
      color: white;
    }

    .btn-small {
      padding: 6px 12px;
      font-size: 0.85rem;
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-small:hover {
      background-color: #e5e7eb;
    }

    /* Section Titles */
    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 24px;
      color: #1f2937;
    }

    /* Stats Section */
    .stats-section {
      margin-bottom: 48px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }

    .stat-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .stat-card.products {
      border-left: 6px solid #3b82f6;
    }

    .stat-card.revenue {
      border-left: 6px solid #10b981;
    }

    .stat-card.average {
      border-left: 6px solid #f59e0b;
    }

    .stat-card.users {
      border-left: 6px solid #8b5cf6;
    }

    .stat-icon {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: #1f2937;
    }

    .stat-label {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 12px 0;
    }

    .stat-link {
      color: #3b82f6;
      font-weight: 600;
      font-size: 0.9rem;
      text-decoration: none;
    }

    .stat-link.disabled {
      color: #9ca3af;
    }

    /* Actions Section */
    .actions-section {
      margin-bottom: 48px;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .action-card {
      background: white;
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 20px;
      text-decoration: none;
      color: inherit;
      position: relative;
    }

    .action-card:hover:not(.disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      border-color: #3b82f6;
    }

    .action-card.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-icon {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3));
    }

    .action-content {
      flex: 1;
    }

    .action-content h3 {
      margin: 0 0 8px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #1f2937;
    }

    .action-content p {
      margin: 0;
      color: #6b7280;
      font-size: 0.95rem;
    }

    .action-arrow {
      font-size: 1.5rem;
      color: #9ca3af;
      transition: all 0.3s ease;
    }

    .action-card:hover:not(.disabled) .action-arrow {
      color: #3b82f6;
      transform: translateX(4px);
    }

    .coming-soon-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background-color: #fbbf24;
      color: #1f2937;
      font-size: 0.7rem;
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Recent Activity */
    .activity-section {
      margin-bottom: 48px;
    }

    .recent-products {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
    }

    .product-item {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .product-icon {
      font-size: 1.8rem;
      background-color: #f3f4f6;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-info {
      flex: 1;
    }

    .product-info h4 {
      margin: 0 0 4px 0;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .product-info p {
      margin: 0;
      color: #10b981;
      font-weight: 600;
    }

    .product-actions {
      display: flex;
      gap: 8px;
    }

    .view-all-products {
      text-align: center;
    }

    /* Icons */
    .icon {
      font-size: inherit;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .home-container {
        padding: 24px;
      }

      .welcome-section {
        flex-direction: column;
        gap: 24px;
        text-align: center;
        padding: 32px;
      }

      .welcome-content h1 {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      }

      .actions-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 16px;
      }

      .welcome-section {
        padding: 24px;
      }

      .welcome-content h1 {
        font-size: 1.8rem;
        flex-direction: column;
        gap: 8px;
      }

      .welcome-actions {
        flex-direction: column;
        width: 100%;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-card {
        padding: 24px;
      }
    }
  `]
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
    // Mostrar los últimos 3 productos (simulando por ID más alto)
    this.recentProducts = [...this.products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 3);
  }
}
