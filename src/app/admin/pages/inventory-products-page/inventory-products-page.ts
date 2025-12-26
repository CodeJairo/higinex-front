import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import {
  CreateVariantPayload,
  InventoryManagementService,
  Product,
} from '../../services/inventory.service';

const PRODUCTS_QUERY = {
  limit: 100,
  offset: 0,
  status: 'ALL',
} as const;

const PRODUCTS_QUERY_KEY = ['inventory', 'products', PRODUCTS_QUERY] as const;

@Component({
  selector: 'app-inventory-products-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inventory-products-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryProductsPage implements OnInit {
  private readonly inventoryService = inject(InventoryManagementService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly queryClient = inject(QueryClient);

  readonly selectedProduct = signal<Product | null>(null);

  readonly variantForm = this.formBuilder.nonNullable.group({
    sku: this.formBuilder.nonNullable.control('', [Validators.required]),
    gtin: this.formBuilder.nonNullable.control(''),
    name: this.formBuilder.nonNullable.control('', [Validators.required]),
    initialOnHand: this.formBuilder.control<number | null>(null),
    attributes: this.formBuilder.array<FormGroup>([]),
  });

  private readonly productsQuery = injectQuery(() => ({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: () =>
      firstValueFrom(
        this.inventoryService.listProducts(
          PRODUCTS_QUERY.limit,
          PRODUCTS_QUERY.offset,
          PRODUCTS_QUERY.status
        )
      ),
  }));

  private readonly publishProductMutation = injectMutation(() => ({
    mutationFn: (productId: string) =>
      firstValueFrom(this.inventoryService.publishProduct(productId)),
    onSuccess: (updated) => this.updateProductCache(updated),
  }));

  private readonly archiveProductMutation = injectMutation(() => ({
    mutationFn: (productId: string) =>
      firstValueFrom(this.inventoryService.archiveProduct(productId)),
    onSuccess: (updated) => this.updateProductCache(updated),
  }));

  private readonly createVariantMutation = injectMutation(() => ({
    mutationFn: (payload: { productId: string; variant: CreateVariantPayload }) =>
      firstValueFrom(this.inventoryService.createVariant(payload.productId, payload.variant)),
    onSuccess: () => this.onResetVariantForm(),
  }));

  readonly isLoading = computed(() => this.productsQuery.isLoading());
  readonly isError = computed(() => this.productsQuery.isError());

  ngOnInit(): void {
    this.onResetVariantForm();
  }

  get products(): Product[] {
    return this.productsQuery.data() ?? [];
  }

  get attributes(): FormArray<FormGroup> {
    return this.variantForm.get('attributes') as FormArray<FormGroup>;
  }

  onSelectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.onResetVariantForm();
  }

  onPublish(product: Product): void {
    this.publishProductMutation.mutate(product.id);
  }

  onArchive(product: Product): void {
    this.archiveProductMutation.mutate(product.id);
  }

  onAddAttribute(): void {
    this.attributes.push(
      this.formBuilder.nonNullable.group({
        key: this.formBuilder.nonNullable.control(''),
        value: this.formBuilder.nonNullable.control(''),
      })
    );
  }

  onRemoveAttribute(index: number): void {
    this.attributes.removeAt(index);
  }

  onResetVariantForm(): void {
    this.variantForm.reset({
      sku: '',
      gtin: '',
      name: '',
      initialOnHand: null,
    });

    this.attributes.clear();
    this.onAddAttribute();
    this.variantForm.markAsPristine();
    this.variantForm.markAsUntouched();
  }

  onSubmitVariant(): void {
    const selectedProduct = this.selectedProduct();
    if (!selectedProduct) {
      return;
    }

    if (this.variantForm.invalid) {
      this.variantForm.markAllAsTouched();
      return;
    }

    const payload = this.buildVariantPayload();
    this.createVariantMutation.mutate({ productId: selectedProduct.id, variant: payload });
  }

  getProductStatusLabel(status: string): string {
    if (status === 'PUBLISHED') {
      return 'Publicado';
    }
    if (status === 'ARCHIVED') {
      return 'Archivado';
    }
    return 'Borrador';
  }

  private updateProductCache(updated: Product): void {
    this.queryClient.setQueryData(PRODUCTS_QUERY_KEY, (current?: Product[]) => {
      if (!current?.length) {
        return [updated];
      }
      return current.map((product) => (product.id === updated.id ? updated : product));
    });

    if (this.selectedProduct()?.id === updated.id) {
      this.selectedProduct.set(updated);
    }
  }

  private buildVariantPayload(): CreateVariantPayload {
    const raw = this.variantForm.getRawValue();
    const payload: CreateVariantPayload = {
      sku: raw.sku.trim(),
      name: raw.name.trim(),
    };

    const gtin = raw.gtin.trim();
    if (gtin) {
      payload.gtin = gtin;
    }

    if (raw.initialOnHand !== null && raw.initialOnHand !== undefined) {
      payload.initialOnHand = raw.initialOnHand;
    }

    const attributesJson = this.buildAttributesJson();
    if (attributesJson) {
      payload.attributesJson = attributesJson;
    }

    return payload;
  }

  private buildAttributesJson(): Record<string, string> | undefined {
    const attributes = this.attributes.controls
      .map((control) => control.getRawValue() as { key?: string; value?: string })
      .map((item) => ({
        key: (item.key ?? '').trim(),
        value: (item.value ?? '').trim(),
      }))
      .filter((item) => item.key && item.value);

    if (!attributes.length) {
      return undefined;
    }

    return attributes.reduce<Record<string, string>>((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});
  }
}
