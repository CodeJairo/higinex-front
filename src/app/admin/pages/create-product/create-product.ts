import {
  AlertCircle,
  CheckCircle,
  Link,
  LucideAngularModule,
  PlusCircle,
  RefreshCw,
  Save,
  Tag,
  X,
} from 'lucide-angular';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { CreateProductPayload } from '../../interfaces/products.interface';
import { InventoryManagementService } from '../../services/inventory.service';

@Component({
  selector: 'app-create-product',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './create-product.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateProduct {
  private readonly inventoryService = inject(InventoryManagementService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly queryClient = inject(QueryClient);

  readonly submitted = signal(false);
  readonly saveSuccess = signal(false);
  readonly isLoading = this.inventoryService.isCreatingProduct;
  readonly createError = this.inventoryService.createProductError;

  // Icons
  readonly AlertCircle = AlertCircle;
  readonly CheckCircle = CheckCircle;
  readonly Link = Link;
  readonly PlusCircle = PlusCircle;
  readonly RefreshCw = RefreshCw;
  readonly Save = Save;
  readonly Tag = Tag;
  readonly X = X;

  readonly form = this.formBuilder.nonNullable.group({
    name: this.formBuilder.nonNullable.control('', [Validators.required]),
    slug: this.formBuilder.nonNullable.control('', [Validators.required]),
    description: this.formBuilder.nonNullable.control('', [Validators.required, Validators.minLength(10)]),
  });

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.saveSuccess.set(false);

    // Auto-generate slug if empty but name is present
    if (!this.form.controls.slug.value && this.form.controls.name.value) {
      this.onGenerateSlug();
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const product = await this.inventoryService.createProduct(payload);
    if (product) {
      this.saveSuccess.set(true);
      // Invalidate products query to trigger refetch
      await this.queryClient.invalidateQueries({ queryKey: ['inventory', 'products'] });
      // Redirect to products list instead of variants
      this.router.navigateByUrl('/admin/inventory/products');
    }
  }

  onGenerateSlug(): void {
    const name = this.form.controls.name.value;
    const slug = this.generateSlug(name);
    this.form.controls.slug.setValue(slug);
    this.form.controls.slug.markAsTouched();
  }

  cancel(): void {
    this.router.navigateByUrl('/admin/inventory/products');
  }

  dismissError(): void {
    this.inventoryService.clearCreateProductError();
  }

  showError(controlName: 'name' | 'slug' | 'description'): boolean {
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
