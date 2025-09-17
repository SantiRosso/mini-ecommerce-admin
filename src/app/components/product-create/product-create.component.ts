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
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss'
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
            alert(`¡Producto "${createdProduct.name}" creado exitosamente!`);
            this.router.navigate(['/']);
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.isSubmitting = false;
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
