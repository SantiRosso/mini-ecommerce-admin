import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <!-- Logo/Brand Section -->
      <div class="sidebar-header">
        <div class="brand">
          <div class="brand-icon">🛒</div>
          <div class="brand-text">
            <h2 class="brand-title">Mini E-commerce</h2>
            <span class="brand-subtitle">Admin Dashboard</span>
          </div>
        </div>
      </div>

      <!-- Navigation Menu -->
      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">PRINCIPAL</span>
          <ul class="nav-menu">
            <li class="nav-item" *ngFor="let item of menuItems">
              <a
                [routerLink]="item.path"
                class="nav-link"
                [class.active]="item.active"
                [class.disabled]="item.disabled"
                (click)="onMenuItemClick(item)">

                <span class="nav-icon">{{ item.icon }}</span>
                <span class="nav-label">{{ item.label }}</span>

                <!-- Badge for notifications or counts -->
                <span class="nav-badge" *ngIf="item.badge">{{ item.badge }}</span>

                <!-- Coming soon indicator -->
                <span class="coming-soon" *ngIf="item.disabled">Próximamente</span>
              </a>
            </li>
          </ul>
        </div>

        <!-- Additional Section for Future Features -->
        <div class="nav-section">
          <span class="nav-section-title">CONFIGURACIÓN</span>
          <ul class="nav-menu">
            <li class="nav-item">
              <a class="nav-link disabled">
                <span class="nav-icon">⚙️</span>
                <span class="nav-label">Configuración</span>
                <span class="coming-soon">Próximamente</span>
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link disabled">
                <span class="nav-icon">📊</span>
                <span class="nav-label">Reportes</span>
                <span class="coming-soon">Próximamente</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <!-- Footer Section -->
      <div class="sidebar-footer">
        <div class="footer-content">
          <div class="user-info">
            <div class="user-avatar">👤</div>
            <div class="user-details">
              <span class="user-name">Administrador</span>
              <span class="user-role">Admin</span>
            </div>
          </div>
          <button class="logout-btn" title="Cerrar sesión">
            <span class="icon">🚪</span>
          </button>
        </div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1000;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header Section */
    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      font-size: 2.5rem;
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }

    .brand-text {
      flex: 1;
    }

    .brand-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .brand-subtitle {
      font-size: 0.85rem;
      opacity: 0.8;
      font-weight: 400;
    }

    /* Navigation Section */
    .sidebar-nav {
      flex: 1;
      padding: 24px 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 32px;
    }

    .nav-section-title {
      display: block;
      padding: 0 20px 8px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      opacity: 0.7;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 12px;
    }

    .nav-menu {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-item {
      margin-bottom: 2px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      font-weight: 500;
    }

    .nav-link:hover:not(.disabled) {
      background-color: rgba(255, 255, 255, 0.1);
      padding-left: 28px;
    }

    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.15);
      border-right: 4px solid #fbbf24;
      font-weight: 600;
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      background-color: #fbbf24;
    }

    .nav-link.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .nav-link.disabled:hover {
      padding-left: 20px;
      background-color: transparent;
    }

    .nav-icon {
      font-size: 1.2rem;
      width: 24px;
      text-align: center;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
    }

    .nav-label {
      flex: 1;
      font-size: 0.95rem;
    }

    .nav-badge {
      background-color: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 16px;
      text-align: center;
      line-height: 1.2;
    }

    .coming-soon {
      font-size: 0.65rem;
      background-color: rgba(251, 191, 36, 0.2);
      color: #fbbf24;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Footer Section */
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      background-color: rgba(0, 0, 0, 0.1);
    }

    .footer-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      line-height: 1;
    }

    .user-role {
      font-size: 0.75rem;
      opacity: 0.8;
      line-height: 1;
    }

    .logout-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.1rem;
      padding: 8px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0.7;
    }

    .logout-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
      opacity: 1;
      transform: scale(1.05);
    }

    /* Scrollbar Styles */
    .sidebar-nav::-webkit-scrollbar {
      width: 4px;
    }

    .sidebar-nav::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }

    .sidebar-nav::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .sidebar {
        width: 260px;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
      }

      .sidebar.mobile-open {
        transform: translateX(0);
      }

      .brand-title {
        font-size: 1.1rem;
      }

      .brand-subtitle {
        font-size: 0.8rem;
      }

      .nav-label {
        font-size: 0.9rem;
      }
    }

    @media (max-width: 480px) {
      .sidebar {
        width: 100%;
      }

      .sidebar-header {
        padding: 20px 16px;
      }

      .nav-link {
        padding: 12px 16px;
      }

      .nav-link:hover:not(.disabled) {
        padding-left: 24px;
      }

      .sidebar-footer {
        padding: 16px;
      }
    }
  `]
})
export class LeftSidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: '🏠',
      active: false
    },
    {
      path: '/products',
      label: 'Products',
      icon: '📦',
      active: false
    },
    {
      path: '/users',
      label: 'Users',
      icon: '👥',
      active: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Actualizar el elemento activo basado en la ruta actual
    this.updateActiveMenuItem();

    // Escuchar cambios de ruta para actualizar el elemento activo
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveMenuItem();
      });
  }

  private updateActiveMenuItem(): void {
    const currentPath = this.router.url;

    this.menuItems.forEach(item => {
      if (item.path === '/') {
        // Para el home, solo activar si la ruta es exactamente '/'
        item.active = currentPath === '/';
      } else {
        // Para otras rutas, activar si la ruta actual comienza con el path del item
        item.active = currentPath.startsWith(item.path);
      }
    });
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.disabled) {
      // Mostrar mensaje para funcionalidades no implementadas
      alert(`La funcionalidad "${item.label}" estará disponible próximamente.`);
      return;
    }

    // La navegación se maneja automáticamente por routerLink
    console.log('Navigating to:', item.path);
  }
}
