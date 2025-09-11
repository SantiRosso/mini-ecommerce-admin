import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'user';
  isActive?: boolean;
}

export interface UserResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API_URL = 'http://localhost:3000/users';

  // Subject para manejar el estado de usuarios
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  /**
   * Cargar todos los usuarios
   */
  loadUsers(): void {
    console.log('Loading users from backend API');
    this.getUsers().subscribe({
      next: (users) => {
        console.log('Users loaded:', users);
        this.usersSubject.next(users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        // Usar datos mock mientras no hay backend
        this.usersSubject.next(this.getMockUsers());
      }
    });
  }

  /**
   * Obtener todos los usuarios
   */
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.API_URL).pipe(
      map(response => response || [])
    );
  }

  /**
   * Obtener un usuario por ID
   */
  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  createUser(userData: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.API_URL, userData).pipe(
      tap(newUser => {
        console.log('User created:', newUser);
        // Recargar la lista de usuarios
        this.loadUsers();
      })
    );
  }

  /**
   * Actualizar un usuario existente
   */
  updateUser(id: number, userData: UpdateUserRequest): Observable<User> {
    return this.http.put<User>(`${this.API_URL}/${id}`, userData).pipe(
      tap(updatedUser => {
        console.log('User updated:', updatedUser);
        // Recargar la lista de usuarios
        this.loadUsers();
      })
    );
  }

  /**
   * Eliminar un usuario
   */
  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log('User deleted:', id);
        // Recargar la lista de usuarios
        this.loadUsers();
      })
    );
  }

  /**
   * Activar/Desactivar usuario
   */
  toggleUserStatus(id: number): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/${id}/toggle-status`, {}).pipe(
      tap(updatedUser => {
        console.log('User status toggled:', updatedUser);
        // Recargar la lista de usuarios
        this.loadUsers();
      })
    );
  }

  /**
   * Obtener usuarios actuales del estado
   */
  getCurrentUsers(): User[] {
    return this.usersSubject.value;
  }

  /**
   * Datos mock para desarrollo (mientras no hay backend)
   */
  private getMockUsers(): User[] {
    return [
      {
        id: 1,
        name: 'Santiago Rosso',
        email: 'santiago@admin.com',
        role: 'admin',
        isActive: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-12-01T14:22:00Z',
        lastLogin: '2024-12-01T14:22:00Z'
      },
      {
        id: 2,
        name: 'María García',
        email: 'maria.garcia@email.com',
        role: 'user',
        isActive: true,
        createdAt: '2024-02-10T09:15:00Z',
        updatedAt: '2024-11-28T16:45:00Z',
        lastLogin: '2024-11-28T16:45:00Z'
      },
      {
        id: 3,
        name: 'Carlos López',
        email: 'carlos.lopez@email.com',
        role: 'user',
        isActive: true,
        createdAt: '2024-03-05T11:20:00Z',
        updatedAt: '2024-11-25T10:30:00Z',
        lastLogin: '2024-11-25T10:30:00Z'
      },
      {
        id: 4,
        name: 'Ana Martínez',
        email: 'ana.martinez@email.com',
        role: 'user',
        isActive: false,
        createdAt: '2024-04-12T14:00:00Z',
        updatedAt: '2024-09-15T12:00:00Z',
        lastLogin: '2024-09-10T09:30:00Z'
      },
      {
        id: 5,
        name: 'Pedro Rodríguez',
        email: 'pedro.rodriguez@email.com',
        role: 'admin',
        isActive: true,
        createdAt: '2024-05-20T08:45:00Z',
        updatedAt: '2024-11-30T17:15:00Z',
        lastLogin: '2024-11-30T17:15:00Z'
      },
      {
        id: 6,
        name: 'Laura Fernández',
        email: 'laura.fernandez@email.com',
        role: 'user',
        isActive: true,
        createdAt: '2024-06-08T13:30:00Z',
        updatedAt: '2024-11-20T11:45:00Z',
        lastLogin: '2024-11-20T11:45:00Z'
      },
      {
        id: 7,
        name: 'Diego Silva',
        email: 'diego.silva@email.com',
        role: 'user',
        isActive: false,
        createdAt: '2024-07-22T16:20:00Z',
        updatedAt: '2024-08-30T14:10:00Z',
        lastLogin: '2024-08-25T15:20:00Z'
      },
      {
        id: 8,
        name: 'Carmen Ruiz',
        email: 'carmen.ruiz@email.com',
        role: 'user',
        isActive: true,
        createdAt: '2024-08-14T12:00:00Z',
        updatedAt: '2024-11-15T09:30:00Z',
        lastLogin: '2024-11-15T09:30:00Z'
      }
    ];
  }
}
