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
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
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
            alert(`¡Producto "${updatedProduct.name}" actualizado exitosamente!`);
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.isSubmitting = false;
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
