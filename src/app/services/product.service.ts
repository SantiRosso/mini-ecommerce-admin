import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Product {
  id: number;
  name: string;
  price: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  price: number;
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
}

export interface ProductResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly API_URL = 'http://localhost:3000/product';

  // Subject para manejar el estado de productos
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProducts();
  }

  /**
   * Cargar todos los productos
   */
  loadProducts(): void {
    console.log('Loading products from backend API');
    this.getProducts().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.productsSubject.next(products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.productsSubject.next([]);
      }
    });
  }

  /**
   * Obtener todos los productos
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.API_URL).pipe(
      map(response => response || [])
    );
  }

  /**
   * Obtener un producto por ID
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`);
  }

  /**
   * Crear un nuevo producto
   */
  createProduct(productData: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(this.API_URL, productData).pipe(
      tap(newProduct => {
        console.log('Product created:', newProduct);
        // Recargar la lista de productos
        this.loadProducts();
      })
    );
  }

  /**
   * Actualizar un producto existente
   */
  updateProduct(id: number, productData: UpdateProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, productData).pipe(
      tap(updatedProduct => {
        console.log('Product updated:', updatedProduct);
        // Recargar la lista de productos
        this.loadProducts();
      })
    );
  }

  /**
   * Eliminar un producto
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      tap(() => {
        console.log('Product deleted:', id);
        // Recargar la lista de productos
        this.loadProducts();
      })
    );
  }

  /**
   * Obtener productos actual del estado
   */
  getCurrentProducts(): Product[] {
    return this.productsSubject.value;
  }
}
