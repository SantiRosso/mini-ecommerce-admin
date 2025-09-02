import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, CreateProductRequest } from '../../services/product.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="product-create-container">
      <!-- Header -->
      <div class="create-header">
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
          <span class="breadcrumb-current">Crear Producto</span>
        </nav>

        <div class="header-actions">
          <button class="btn-secondary" (click)="goBack()">
            <span class="icon">←</span>
            Cancelar
          </button>
        </div>
      </div>

      <!-- Formulario Principal -->
      <div class="form-container">
        <div class="form-card">
          <div class="card-header">
            <h1 class="form-title">
              <span class="icon">➕</span>
              Crear Nuevo Producto
            </h1>
            <p class="form-subtitle">Complete la información del producto que desea agregar al inventario</p>
          </div>

          <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
            <!-- Información Básica -->
            <div class="form-section">
              <h3 class="section-title">
                <span class="icon">ℹ️</span>
                Información Básica
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
                  placeholder="Ej: iPhone 15 Pro Max"
                  maxlength="100">

                <div class="field-info">
                  <span class="char-count">\{{ getFieldValue('name')?.length || 0 }}/100 caracteres</span>
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
                    placeholder="0.00"
                    min="0"
                    step="0.01">
                </div>

                <div class="field-info">
                  <span class="price-preview" *ngIf="getFieldValue('price')">
                    Precio: $\{{ formatPrice(getFieldValue('price')) }}
                  </span>
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

            <!-- Preview del Producto -->
            <div class="form-section" *ngIf="productForm.get('name')?.value || productForm.get('price')?.value">
              <h3 class="section-title">
                <span class="icon">👀</span>
                Vista Previa
              </h3>

              <div class="product-preview">
                <div class="preview-card">
                  <div class="preview-icon">📦</div>
                  <div class="preview-content">
                    <h4 class="preview-name">
                      \{{ getFieldValue('name') || 'Nombre del producto' }}
                    </h4>
                    <div class="preview-price">
                      $\{{ formatPrice(getFieldValue('price') || 0) }}
                    </div>
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
                Limpiar Formulario
              </button>

              <button
                type="submit"
                class="btn-primary"
                [disabled]="productForm.invalid || isSubmitting">
                <span class="icon" *ngIf="!isSubmitting">✅</span>
                <span class="spinner" *ngIf="isSubmitting"></span>
                \{{ isSubmitting ? 'Creando...' : 'Crear Producto' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Panel de Ayuda -->
        <div class="help-panel">
          <h3 class="help-title">
            <span class="icon">💡</span>
            Consejos para crear productos
          </h3>

          <div class="help-content">
            <div class="help-tip">
              <span class="tip-icon">📝</span>
              <div class="tip-text">
                <strong>Nombre descriptivo:</strong> Use nombres claros y específicos que ayuden a identificar el producto fácilmente.
              </div>
            </div>

            <div class="help-tip">
              <span class="tip-icon">💰</span>
              <div class="tip-text">
                <strong>Precio competitivo:</strong> Asegúrese de establecer un precio acorde al mercado y a la calidad del producto.
              </div>
            </div>

            <div class="help-tip">
              <span class="tip-icon">🎯</span>
              <div class="tip-text">
                <strong>Información completa:</strong> Complete todos los campos obligatorios para una mejor experiencia del usuario.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .product-create-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* Header */
    .create-header {
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
      transition: border-color 0.2s ease;
    }

    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .form-input.error {
      border-color: #ef4444;
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
    }

    .char-count {
      font-family: monospace;
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

    /* Product Preview */
    .product-preview {
      padding: 20px;
      background-color: #f9fafb;
      border-radius: 12px;
      border: 2px dashed #d1d5db;
    }

    .preview-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .preview-icon {
      font-size: 2.5rem;
      opacity: 0.7;
    }

    .preview-content {
      flex: 1;
    }

    .preview-name {
      margin: 0 0 4px 0;
      font-size: 1.1rem;
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

    /* Help Panel */
    .help-panel {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e5e7eb;
      padding: 24px;
      height: fit-content;
    }

    .help-title {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0 0 20px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #374151;
    }

    .help-content {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .help-tip {
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

      .help-panel {
        order: -1;
      }
    }

    @media (max-width: 768px) {
      .product-create-container {
        padding: 16px;
      }

      .create-header {
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
export class ProductCreateComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  isSubmitting: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private productService: ProductService
  ) {
    this.productForm = this.createForm();
  }

  ngOnInit(): void {
    // Opcional: Cargar datos adicionales si es necesario
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

  // Form helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldValue(fieldName: string): any {
    return this.productForm.get(fieldName)?.value;
  }

  formatPrice(price: number): string {
    if (!price) return '0.00';
    return price.toFixed(2);
  }

  // Form actions
  resetForm(): void {
    this.productForm.reset();
    this.productForm.markAsUntouched();
  }

  onSubmit(): void {
    if (this.productForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      const productData: CreateProductRequest = {
        name: this.productForm.value.name.trim(),
        price: parseFloat(this.productForm.value.price)
      };

      console.log('Creating product:', productData);

      this.productService.createProduct(productData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdProduct) => {
            console.log('Product created successfully:', createdProduct);

            // Mostrar mensaje de éxito
            alert(`¡Producto "${createdProduct.name}" creado exitosamente!`);

            // Redirigir al dashboard
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.isSubmitting = false;

            // Mostrar mensaje de error
            alert('Error al crear el producto. Por favor, intenta de nuevo.');
          }
        });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.productForm.controls).forEach(key => {
        this.productForm.get(key)?.markAsTouched();
      });
    }
  }

  // Navigation
  goBack(): void {
    if (this.productForm.dirty) {
      const confirmLeave = confirm('¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.');
      if (confirmLeave) {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }
}
