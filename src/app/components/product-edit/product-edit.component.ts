import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, Product, UpdateProductRequest } from '../../services/product.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="product-edit-container">
      <!-- Header -->
      <div class="edit-header">
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
          <span class="breadcrumb-current">Editar Producto</span>
          <span class="breadcrumb-separator" *ngIf="currentProduct">/</span>
          <span class="breadcrumb-current" *ngIf="currentProduct">#{{ currentProduct.id }}</span>
        </nav>

        <div class="header-actions">
          <button class="btn-secondary" (click)="goBack()">
            <span class="icon">←</span>
            Cancelar
          </button>
          <button class="btn-info" (click)="viewProductDetail()" *ngIf="currentProduct">
            <span class="icon">👁️</span>
            Ver Detalle
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <div class="loading-spinner"></div>
        <p>Cargando producto...</p>
      </div>

      <!-- Error State -->
      <div class="error-container" *ngIf="loadError">
        <div class="error-icon">⚠️</div>
        <h2>Error al cargar el producto</h2>
        <p>{{ loadError }}</p>
        <div class="error-actions">
          <button class="btn-primary" (click)="loadProduct()">
            <span class="icon">🔄</span>
            Reintentar
          </button>
          <button class="btn-secondary" (click)="goBack()">
            <span class="icon">←</span>
            Volver
          </button>
        </div>
      </div>

      <!-- Formulario Principal -->
      <div class="form-container" *ngIf="!isLoading && !loadError && currentProduct">
        <div class="form-card">
          <div class="card-header">
            <h1 class="form-title">
              <span class="icon">✏️</span>
              Editar Producto
            </h1>
            <p class="form-subtitle">Modifica la información del producto "{{ currentProduct.name }}"</p>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
            <!-- Información del Producto Original -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="icon">📋</span>
                Información Actual
              </h3>

              <div class="current-info">
                <div class="info-card">
                  <div class="info-row">
                    <strong>ID:</strong>
                    <span>#{{ currentProduct.id }}</span>
                  </div>
                  <div class="info-row">
                    <strong>Nombre actual:</strong>
                    <span>{{ currentProduct.name }}</span>
                  </div>
                  <div class="info-row">
                    <strong>Precio actual:</strong>
                    <span>\${{ currentProduct.price | number:'1.2-2' }}</span>
                  </div>
                  <div class="info-row">
                    <strong>Fecha de creación:</strong>
                    <span>{{ formatDateTime(currentProduct.createdAt) }}</span>
                  </div>
                  <div class="info-row">
                    <strong>Última actualización:</strong>
                    <span>{{ formatDateTime(currentProduct.updatedAt) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Información Nueva -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="icon">✨</span>
                Nueva Información
              </h3>

              <!-- Nombre del Producto -->
              <div class="form-group">
                <label for="name" class="form-label">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  class="form-input"
                  [class.error]="isFieldInvalid('name')"
                  [class.changed]="hasFieldChanged('name')"
                  placeholder="Ej: iPhone 15 Pro Max"
                  maxlength="100">

                <div class="field-info">
                  <span class="char-count">{{ getFieldValue('name')?.length || 0 }}/100 caracteres</span>
                  <span class="change-indicator" *ngIf="hasFieldChanged('name')">• Modificado</span>
                </div>

                <div class="error-message" *ngIf="isFieldInvalid('name')">
                  <span class="error-icon">⚠️</span>
                  <span *ngIf="productForm.get('name')?.errors?.['required']">
                    El nombre del producto es obligatorio
                  </span>
                  <span *ngIf="productForm.get('name')?.errors?.['minlength']">
                    El nombre debe tener al menos 2 caracteres
                  </span>
                  <span *ngIf="productForm.get('name')?.errors?.['maxlength']">
                    El nombre no puede exceder los 100 caracteres
                  </span>
                </div>
              </div>

              <!-- Precio -->
              <div class="form-group">
                <label for="price" class="form-label">
                  Precio *
                </label>
                <div class="price-input-container">
                  <span class="currency-symbol">$</span>
                  <input
                    type="number"
                    id="price"
                    formControlName="price"
                    class="form-input price-input"
                    [class.error]="isFieldInvalid('price')"
                    [class.changed]="hasFieldChanged('price')"
                    placeholder="0.00"
                    min="0"
                    step="0.01">
                </div>

                <div class="field-info">
                  <span class="price-preview" *ngIf="getFieldValue('price')">
                    Precio: \${{ formatPrice(getFieldValue('price')) }}
                  </span>
                  <span class="change-indicator" *ngIf="hasFieldChanged('price')">• Modificado</span>
                </div>

                <div class="error-message" *ngIf="isFieldInvalid('price')">
                  <span class="error-icon">⚠️</span>
                  <span *ngIf="productForm.get('price')?.errors?.['required']">
                    El precio es obligatorio
                  </span>
                  <span *ngIf="productForm.get('price')?.errors?.['min']">
                    El precio debe ser mayor a $0
                  </span>
                  <span *ngIf="productForm.get('price')?.errors?.['max']">
                    El precio no puede exceder $999,999.99
                  </span>
                </div>
              </div>
            </div>

            <!-- Comparación del Producto -->
            <div class="form-section" *ngIf="hasAnyChanges()">
              <h3 class="section-title">
                <span class="icon">🔄</span>
                Vista Previa de Cambios
              </h3>

              <div class="comparison-container">
                <div class="comparison-card before">
                  <h4>Antes</h4>
                  <div class="preview-content">
                    <div class="preview-name">{{ currentProduct.name }}</div>
                    <div class="preview-price">\${{ currentProduct.price | number:'1.2-2' }}</div>
                  </div>
                </div>

                <div class="comparison-arrow">→</div>

                <div class="comparison-card after">
                  <h4>Después</h4>
                  <div class="preview-content">
                    <div class="preview-name">{{ getFieldValue('name') || currentProduct.name }}</div>
                    <div class="preview-price">\${{ formatPrice(getFieldValue('price') || currentProduct.price) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones de Acción -->
            <div class="form-actions">
              <button
                type="button"
                class="btn-secondary"
                (click)="resetForm()"
                [disabled]="isSubmitting">
                <span class="icon">🔄</span>
                Restablecer
              </button>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="productForm.invalid || isSubmitting || !hasAnyChanges()">
                <span class="icon" *ngIf="!isSubmitting">💾</span>
                <span class="spinner" *ngIf="isSubmitting"></span>
                {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Panel de Información -->
        <div class="info-panel">
          <h3 class="info-title">
            <span class="icon">💡</span>
            Información de Edición
          </h3>

          <div class="info-content">
            <div class="info-tip">
              <span class="tip-icon">✏️</span>
              <div class="tip-text">
                <strong>Edición:</strong> Solo se actualizarán los campos que hayas modificado.
              </div>
            </div>

            <div class="info-tip">
              <span class="tip-icon">💾</span>
              <div class="tip-text">
                <strong>Guardado:</strong> Los cambios se guardarán inmediatamente al hacer clic en "Guardar Cambios".
              </div>
            </div>

            <div class="info-tip">
              <span class="tip-icon">🔍</span>
              <div class="tip-text">
                <strong>Vista previa:</strong> Puedes ver cómo quedará el producto antes de guardar los cambios.
              </div>
            </div>

            <div class="info-tip" *ngIf="!hasAnyChanges()">
              <span class="tip-icon">⚡</span>
              <div class="tip-text">
                <strong>Sin cambios:</strong> Modifica algún campo para habilitar el botón de guardar.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-edit-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header */
    .edit-header {
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
    .btn-primary, .btn-secondary, .btn-info {
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

    .btn-primary:hover:not(:disabled) {
      background-color: #2563eb;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
      transform: none;
    }

    .btn-secondary {
      background-color: #f3f4f6;
      color: #374151;
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: #e5e7eb;
    }

    .btn-info {
      background-color: #0ea5e9;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background-color: #0284c7;
    }

    /* Loading and Error States */
    .loading-container, .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 64px 32px;
      text-align: center;
    }

    .loading-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e5e7eb;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    .error-container {
      background-color: #fef2f2;
      border: 2px solid #fecaca;
      border-radius: 12px;
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }

    .error-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    /* Form Container */
    .form-container {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 32px;
    }

    .form-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .card-header {
      padding: 32px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
    }

    .form-title {
      margin: 0 0 8px 0;
      font-size: 2rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .form-subtitle {
      margin: 0;
      font-size: 1.1rem;
      opacity: 0.9;
    }

    /* Form */
    .product-form {
      padding: 32px;
    }

    .form-section {
      margin-bottom: 32px;
    }

    .section-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      font-size: 1.2rem;
      font-weight: 600;
      color: #374151;
      padding-bottom: 8px;
      border-bottom: 2px solid #f3f4f6;
    }

    /* Current Info Section */
    .current-info {
      margin-bottom: 20px;
    }

    .info-card {
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-row strong {
      color: #374151;
    }

    .info-row span {
      color: #6b7280;
      font-weight: 500;
    }

    /* Form Controls */
    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: #374151;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 16px;
      transition: all 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .form-input.error {
      border-color: #ef4444;
    }

    .form-input.changed {
      border-color: #f59e0b;
      background-color: #fffbeb;
    }

    .price-input-container {
      position: relative;
    }

    .currency-symbol {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      font-weight: 600;
      color: #6b7280;
      z-index: 1;
    }

    .price-input {
      padding-left: 40px;
    }

    .field-info {
      margin-top: 4px;
      font-size: 12px;
      color: #6b7280;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .char-count {
      font-family: monospace;
    }

    .change-indicator {
      color: #f59e0b;
      font-weight: 600;
    }

    .price-preview {
      font-weight: 600;
      color: #059669;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 6px;
      padding: 8px 12px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: 6px;
      font-size: 14px;
      color: #dc2626;
    }

    .error-icon {
      font-size: 16px;
    }

    /* Comparison Section */
    .comparison-container {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 20px;
      align-items: center;
    }

    .comparison-card {
      padding: 20px;
      border-radius: 12px;
      text-align: center;
    }

    .comparison-card.before {
      background-color: #f3f4f6;
      border: 2px solid #d1d5db;
    }

    .comparison-card.after {
      background-color: #ecfdf5;
      border: 2px solid #10b981;
    }

    .comparison-card h4 {
      margin: 0 0 12px 0;
      font-size: 0.9rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .comparison-arrow {
      font-size: 1.5rem;
      font-weight: bold;
      color: #6b7280;
    }

    .preview-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .preview-name {
      font-weight: 600;
      color: #1f2937;
    }

    .preview-price {
      font-size: 1.2rem;
      font-weight: 700;
      color: #059669;
    }

    /* Form Actions */
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding-top: 24px;
      border-top: 2px solid #f3f4f6;
    }

    /* Info Panel */
    .info-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      padding: 24px;
      height: fit-content;
    }

    .info-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
    }

    .info-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .info-tip {
      display: flex;
      gap: 12px;
      padding: 16px;
      background-color: #f9fafb;
      border-radius: 8px;
      border-left: 4px solid #3b82f6;
    }

    .tip-icon {
      font-size: 1.2rem;
      margin-top: 2px;
    }

    .tip-text {
      font-size: 14px;
      line-height: 1.5;
    }

    .tip-text strong {
      color: #374151;
    }

    /* Spinner */
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Icons */
    .icon {
      font-size: inherit;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .form-container {
        grid-template-columns: 1fr;
      }

      .info-panel {
        order: -1;
      }

      .comparison-container {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .comparison-arrow {
        transform: rotate(90deg);
      }
    }

    @media (max-width: 768px) {
      .product-edit-container {
        padding: 16px;
      }

      .edit-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
      }

      .header-actions {
        justify-content: flex-end;
      }

      .form-title {
        font-size: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .breadcrumbs {
        flex-wrap: wrap;
      }
    }
  `]
})
export class ProductEditComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  currentProduct: Product | null = null;
  isLoading: boolean = true;
  isSubmitting: boolean = false;
  loadError: string | null = null;
  productId: string | null = null;

  private destroy$ = new Subject<void>();
  private originalValues: any = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.productId = params['id'];
      if (this.productId) {
        this.loadProduct();
      } else {
        this.loadError = 'ID de producto no válido';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      price: ['', [
        Validators.required,
        Validators.min(0.01),
        Validators.max(999999.99)
      ]]
    });
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.isLoading = true;
    this.loadError = null;

    const id = parseInt(this.productId, 10);
    if (isNaN(id)) {
      this.loadError = 'ID de producto no válido';
      this.isLoading = false;
      return;
    }

    this.productService.getProductById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product) => {
          this.currentProduct = product;
          this.populateForm(product);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading product:', error);
          this.loadError = 'No se pudo cargar el producto. Verifica que el ID sea correcto.';
          this.isLoading = false;
        }
      });
  }

  private populateForm(product: Product): void {
    this.originalValues = {
      name: product.name,
      price: product.price
    };

    this.productForm.patchValue({
      name: product.name,
      price: product.price
    });

    this.productForm.markAsUntouched();
  }

  // Form helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldValue(fieldName: string): any {
    return this.productForm.get(fieldName)?.value;
  }

  hasFieldChanged(fieldName: string): boolean {
    const currentValue = this.getFieldValue(fieldName);
    const originalValue = this.originalValues[fieldName];
    return currentValue !== originalValue;
  }

  hasAnyChanges(): boolean {
    return Object.keys(this.originalValues).some(field => this.hasFieldChanged(field));
  }

  formatPrice(price: number): string {
    if (!price) return '0.00';
    return price.toFixed(2);
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

  // Form actions
  resetForm(): void {
    if (this.currentProduct) {
      this.populateForm(this.currentProduct);
    }
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting && this.hasAnyChanges() && this.currentProduct) {
      this.isSubmitting = true;

      const updateData: UpdateProductRequest = {
        name: this.productForm.value.name.trim(),
        price: parseFloat(this.productForm.value.price)
      };

      console.log('Updating product:', this.currentProduct.id, updateData);

      this.productService.updateProduct(this.currentProduct.id, updateData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (updatedProduct) => {
            console.log('Product updated successfully:', updatedProduct);

            // Mostrar mensaje de éxito
            alert(`¡Producto "${updatedProduct.name}" actualizado exitosamente!`);

            // Redirigir al dashboard
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.isSubmitting = false;

            // Mostrar mensaje de error
            alert('Error al actualizar el producto. Por favor, intenta de nuevo.');
          }
        });
    } else if (!this.hasAnyChanges()) {
      alert('No hay cambios para guardar.');
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  // Navigation
  goBack(): void {
    if (this.productForm.dirty && this.hasAnyChanges()) {
      const confirmLeave = confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.');
      if (confirmLeave) {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  viewProductDetail(): void {
    if (this.currentProduct) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/product', this.currentProduct.id])
      );
      window.open(url, '_blank');
    }
  }
}
