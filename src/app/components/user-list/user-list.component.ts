import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { UserService, User } from '../../services/user.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="user-list-container">
      <!-- Header -->
      <div class="list-header">
        <div class="header-content">
          <h1 class="page-title">
            <span class="icon">👥</span>
            Gestión de Usuarios
          </h1>
          <p class="page-subtitle">Administra los usuarios de la plataforma</p>
        </div>
        <div class="header-actions">
          <button class="btn-primary" (click)="refreshUsers()">
            <span class="icon">🔄</span>
            Actualizar
          </button>
          <button class="btn-success" (click)="createUser()">
            <span class="icon">➕</span>
            Nuevo Usuario
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👤</div>
          <div class="stat-content">
            <h3>{{ users.length }}</h3>
            <p>Total Usuarios</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>{{ getActiveUsersCount() }}</h3>
            <p>Usuarios Activos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">🔧</div>
          <div class="stat-content">
            <h3>{{ getAdminUsersCount() }}</h3>
            <p>Administradores</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>{{ getRecentUsersCount() }}</h3>
            <p>Nuevos (30 días)</p>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="search-section">
        <div class="search-container">
          <div class="search-input-group">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar usuarios por nombre o email..."
              [(ngModel)]="searchTerm"
              (input)="filterUsers()"
              class="search-input">
          </div>

          <div class="filter-group">
            <select [(ngModel)]="selectedRole" (change)="filterUsers()" class="filter-select">
              <option value="">Todos los roles</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuarios</option>
            </select>

            <select [(ngModel)]="selectedStatus" (change)="filterUsers()" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>
          </div>
        </div>

        <div class="results-info">
          <span class="results-count">{{ filteredUsers.length }} de {{ users.length }} usuarios</span>
          <button class="btn-clear" (click)="clearFilters()" *ngIf="hasActiveFilters()">
            <span class="icon">✖️</span>
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Users Table -->
      <div class="table-container">
        <div class="table-wrapper">
          <table class="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Último Acceso</th>
                <th>Fecha Registro</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers; trackBy: trackByUserId">
                <td class="id-cell">
                  <span class="user-id">#{{ user.id }}</span>
                </td>
                <td class="user-cell">
                  <div class="user-info">
                    <div class="user-avatar">
                      <span class="avatar-text">{{ getInitials(user.name) }}</span>
                    </div>
                    <div class="user-details">
                      <span class="name">{{ user.name }}</span>
                    </div>
                  </div>
                </td>
                <td class="email-cell">
                  <span class="email">{{ user.email }}</span>
                </td>
                <td class="role-cell">
                  <span class="role-badge" [class]="'role-' + user.role">
                    <span class="role-icon">{{ user.role === 'admin' ? '🔧' : '👤' }}</span>
                    {{ user.role === 'admin' ? 'Admin' : 'Usuario' }}
                  </span>
                </td>
                <td class="status-cell">
                  <span class="status-badge" [class]="user.isActive ? 'status-active' : 'status-inactive'">
                    <span class="status-dot"></span>
                    {{ user.isActive ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="date-cell">
                  <span class="date">{{ formatDate(user.lastLogin) }}</span>
                </td>
                <td class="date-cell">
                  <span class="date">{{ formatDate(user.createdAt) }}</span>
                </td>
                <td class="actions-cell">
                  <div class="actions-group">
                    <button
                      class="action-btn view-btn"
                      (click)="viewUser(user)"
                      title="Ver detalles">
                      <span class="icon">👁️</span>
                    </button>
                    <button
                      class="action-btn edit-btn"
                      (click)="editUser(user)"
                      title="Editar usuario">
                      <span class="icon">✏️</span>
                    </button>
                    <button
                      class="action-btn toggle-btn"
                      [class]="user.isActive ? 'deactivate-btn' : 'activate-btn'"
                      (click)="toggleUserStatus(user)"
                      [title]="user.isActive ? 'Desactivar usuario' : 'Activar usuario'">
                      <span class="icon">{{ user.isActive ? '🔒' : '🔓' }}</span>
                    </button>
                    <button
                      class="action-btn delete-btn"
                      (click)="deleteUser(user)"
                      title="Eliminar usuario">
                      <span class="icon">🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="filteredUsers.length === 0">
          <div class="empty-icon">👥</div>
          <h3>No se encontraron usuarios</h3>
          <p>{{ users.length === 0 ? 'No hay usuarios registrados en el sistema.' : 'Intenta ajustar los filtros de búsqueda.' }}</p>
          <button class="btn-primary" (click)="createUser()" *ngIf="users.length === 0">
            <span class="icon">➕</span>
            Crear Primer Usuario
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-list-container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header */
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e5e7eb;
    }

    .header-content h1 {
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .header-content p {
      margin: 0;
      color: #6b7280;
      font-size: 1.1rem;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    /* Buttons */
    .btn-primary, .btn-success, .btn-clear {
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

    .btn-clear {
      background-color: #f3f4f6;
      color: #6b7280;
      font-size: 14px;
      padding: 8px 12px;
    }

    .btn-clear:hover {
      background-color: #e5e7eb;
    }

    /* Stats Cards */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;
      margin-bottom: 32px;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 16px;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-icon {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
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

    /* Search and Filters */
    .search-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }

    .search-container {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 20px;
      align-items: center;
      margin-bottom: 16px;
    }

    .search-input-group {
      position: relative;
    }

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 16px;
      color: #9ca3af;
    }

    .search-input {
      width: 100%;
      padding: 12px 12px 12px 40px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: border-color 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .filter-group {
      display: flex;
      gap: 12px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 2px solid #e5e7eb;
      border-radius: 6px;
      background: white;
      font-size: 14px;
      cursor: pointer;
    }

    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .results-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
      color: #6b7280;
    }

    /* Table */
    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .users-table {
      width: 100%;
      border-collapse: collapse;
    }

    .users-table th {
      background-color: #f9fafb;
      padding: 16px 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    .users-table td {
      padding: 16px 12px;
      border-bottom: 1px solid #f3f4f6;
    }

    .users-table tr:hover {
      background-color: #f9fafb;
    }

    /* Table Cells */
    .id-cell {
      font-family: monospace;
      font-weight: 600;
      color: #6b7280;
    }

    .user-cell {
      min-width: 200px;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      font-size: 14px;
    }

    .user-details .name {
      font-weight: 600;
      color: #1f2937;
    }

    .email-cell {
      color: #6b7280;
      font-family: monospace;
      font-size: 14px;
    }

    .role-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .role-admin {
      background-color: #fef3c7;
      color: #d97706;
      border: 1px solid #fbbf24;
    }

    .role-user {
      background-color: #dbeafe;
      color: #2563eb;
      border: 1px solid #60a5fa;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background-color: #d1fae5;
      color: #065f46;
      border: 1px solid #10b981;
    }

    .status-inactive {
      background-color: #fee2e2;
      color: #991b1b;
      border: 1px solid #ef4444;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .date-cell {
      color: #6b7280;
      font-size: 14px;
      white-space: nowrap;
    }

    /* Actions */
    .actions-cell {
      width: 200px;
    }

    .actions-group {
      display: flex;
      gap: 6px;
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      transition: all 0.2s ease;
    }

    .view-btn {
      background-color: #dbeafe;
      color: #2563eb;
    }

    .view-btn:hover {
      background-color: #bfdbfe;
      transform: scale(1.1);
    }

    .edit-btn {
      background-color: #fef3c7;
      color: #d97706;
    }

    .edit-btn:hover {
      background-color: #fde68a;
      transform: scale(1.1);
    }

    .toggle-btn {
      transition: all 0.2s ease;
    }

    .activate-btn {
      background-color: #d1fae5;
      color: #065f46;
    }

    .activate-btn:hover {
      background-color: #a7f3d0;
      transform: scale(1.1);
    }

    .deactivate-btn {
      background-color: #fed7aa;
      color: #c2410c;
    }

    .deactivate-btn:hover {
      background-color: #fdba74;
      transform: scale(1.1);
    }

    .delete-btn {
      background-color: #fee2e2;
      color: #dc2626;
    }

    .delete-btn:hover {
      background-color: #fecaca;
      transform: scale(1.1);
    }

    /* Empty State */
    .empty-state {
      padding: 64px 32px;
      text-align: center;
      color: #6b7280;
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
    }

    /* Icons */
    .icon {
      font-size: inherit;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .search-container {
        grid-template-columns: 1fr;
      }

      .filter-group {
        justify-content: flex-start;
      }

      .results-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    @media (max-width: 768px) {
      .user-list-container {
        padding: 16px;
      }

      .list-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
      }

      .header-actions {
        justify-content: flex-end;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .actions-group {
        flex-wrap: wrap;
      }

      .users-table {
        font-size: 14px;
      }

      .users-table th,
      .users-table td {
        padding: 12px 8px;
      }
    }
  `]
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.filterUsers();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Filter and search methods
  filterUsers(): void {
    let filtered = [...this.users];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    // Filter by role
    if (this.selectedRole) {
      filtered = filtered.filter(user => user.role === this.selectedRole);
    }

    // Filter by status
    if (this.selectedStatus) {
      const isActive = this.selectedStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    this.filteredUsers = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.filterUsers();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedRole || this.selectedStatus);
  }

  // Statistics methods
  getActiveUsersCount(): number {
    return this.users.filter(user => user.isActive).length;
  }

  getAdminUsersCount(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  getRecentUsersCount(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.users.filter(user => {
      if (!user.createdAt) return false;
      return new Date(user.createdAt) > thirtyDaysAgo;
    }).length;
  }

  // Utility methods
  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
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
  refreshUsers(): void {
    console.log('Refreshing users');
    this.userService.loadUsers();
  }

  createUser(): void {
    console.log('Navigate to create user form');
    // TODO: Implementar navegación a formulario de creación
    alert('Funcionalidad de crear usuario - Próximamente');
  }

  viewUser(user: User): void {
    console.log('View user:', user);
    // TODO: Implementar vista de detalles
    alert(`Ver detalles de usuario: ${user.name}`);
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
    // TODO: Implementar formulario de edición
    alert(`Editar usuario: ${user.name}`);
  }

  toggleUserStatus(user: User): void {
    const action = user.isActive ? 'desactivar' : 'activar';
    const confirmToggle = confirm(`¿Estás seguro de que quieres ${action} a "${user.name}"?`);

    if (confirmToggle) {
      this.userService.toggleUserStatus(user.id).subscribe({
        next: (updatedUser) => {
          console.log('User status toggled successfully:', updatedUser);
        },
        error: (error) => {
          console.error('Error toggling user status:', error);
          alert('Error al cambiar el estado del usuario. Por favor, intenta de nuevo.');
        }
      });
    }
  }

  deleteUser(user: User): void {
    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar a "${user.name}"?\n\nEsta acción no se puede deshacer.`);

    if (confirmDelete) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          console.log('User deleted successfully');
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          alert('Error al eliminar el usuario. Por favor, intenta de nuevo.');
        }
      });
    }
  }
}
