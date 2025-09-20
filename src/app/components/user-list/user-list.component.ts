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
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm: string = '';
  filterRole: string = '';
  filterStatus: string = '';

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

  filterUsers(): void {
    let filtered = [...this.users];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }

    if (this.filterRole) {
      filtered = filtered.filter(user => user.role === this.filterRole);
    }

    if (this.filterStatus) {
      const isActive = this.filterStatus === 'active';
      filtered = filtered.filter(user => user.isActive === isActive);
    }

    this.filteredUsers = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterRole = '';
    this.filterStatus = '';
    this.filterUsers();
  }

  hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.filterRole || this.filterStatus);
  }

  getTotalUsers(): number {
    return this.users.length;
  }

  getActiveUsers(): number {
    return this.users.filter(user => user.isActive).length;
  }

  getAdminUsers(): number {
    return this.users.filter(user => user.role === 'admin').length;
  }

  getNewUsersThisMonth(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.users.filter(user => {
      if (!user.createdAt) return false;
      return new Date(user.createdAt) > thirtyDaysAgo;
    }).length;
  }

  onSearch(): void {
    this.filterUsers();
  }

  onFilterChange(): void {
    this.filterUsers();
  }

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

  createUser(): void {
    console.log('Navigate to create user form');
    alert('Funcionalidad de crear usuario - Próximamente');
  }

  exportUsers(): void {
    console.log('Export users functionality');
    alert('Funcionalidad de exportar usuarios - Próximamente');
  }

  viewUser(user: User): void {
    console.log('View user:', user);
    alert(`Ver detalles de usuario: ${user.name}`);
  }

  editUser(user: User): void {
    console.log('Edit user:', user);
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
