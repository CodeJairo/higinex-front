import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateProductPayload, InventoryManagementService } from '../../services/inventory.service';

@Component({
  selector: 'app-create-product',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-product.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProduct {
  private readonly inventoryService = inject(InventoryManagementService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly submitted = signal(false);
  readonly saveSuccess = signal(false);
  readonly isLoading = this.inventoryService.isCreatingProduct;
  readonly createError = this.inventoryService.createProductError;

  readonly form = this.formBuilder.nonNullable.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required]),
    slug: this.formBuilder.nonNullable.control('', [Validators.required]),
    description: this.formBuilder.nonNullable.control(''),
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.saveSuccess.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const success = await this.inventoryService.createProduct(payload);
    if (success) {
      this.saveSuccess.set(true);
      this.resetForm();
    }
  }

  onGenerateSlug(): void {
    const name = this.form.controls.name.value;
    const slug = this.generateSlug(name);
    this.form.controls.slug.setValue(slug);
    this.form.controls.slug.markAsTouched();
  }

  cancel(): void {
    this.router.navigateByUrl('/admin/inventory');
  }

  dismissError(): void {
    this.inventoryService.clearCreateProductError();
  }

  showError(controlName: 'name' | 'slug'): boolean {
    const control = this.form.get(controlName);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  hasError(controlName: 'name' | 'slug', error: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.hasError(error);
  }

  private resetForm(): void {
    this.form.reset({
      name: '',
      slug: '',
      description: '',
    });
    this.submitted.set(false);
  }

  private buildPayload(): CreateProductPayload {
    const value = this.form.getRawValue();
    const payload: CreateProductPayload = {
      name: value.name.trim(),
      slug: value.slug.trim(),
    };

    const description = value.description.trim();
    if (description) {
      payload.description = description;
    }

    return payload;
  }

  private generateSlug(value: string): string {
    return value.trim().toLowerCase().replace(/\s+/g, '-');
  }
}
