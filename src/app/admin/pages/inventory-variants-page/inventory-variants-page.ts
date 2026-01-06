import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  Archive,
  CircleCheckBig,
  Image as ImageIcon,
  LucideAngularModule,
  Package,
  Plus,
  Save,
  SquarePen,
  Star,
  Trash2,
  X,
} from 'lucide-angular';
import { VariantsService } from '../../services/variants.service';
import { ProductVariant, CreateVariantPayload, UpdateVariantPayload } from '../../interfaces';

@Component({
  selector: 'app-inventory-variants-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LucideAngularModule],
  templateUrl: './inventory-variants-page.html',
})
export class InventoryVariantsPage {
  private readonly route = inject(ActivatedRoute);
  private readonly variantsService = inject(VariantsService);
  private readonly fb = inject(FormBuilder);

  readonly productId = signal<string>(this.route.snapshot.paramMap.get('productId') ?? '');

  // --- Queries ---

  private readonly variantsQuery = injectQuery(() => ({
    queryKey: ['variants'],
    queryFn: () =>
      this.variantsService.listVariantsRequest({
        limit: 100,
        status: 'all',
        productStatus: 'all',
      }),
  }));

  readonly variants = computed(() => {
    const allVariants = this.variantsQuery.data() ?? [];
    return allVariants
      .filter((v) => v.product?.id === this.productId() || v.productId === this.productId())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  readonly isLoading = computed(() => this.variantsQuery.isLoading());

  // Computes the product name from the first found variant (fallback mechanism)
  readonly productName = computed(() => {
    const list = this.variants();
    if (list.length > 0 && list[0].product) {
      return list[0].product.name;
    }
    return 'Producto';
  });

  // --- UI State ---
  readonly isFormOpen = signal(false);
  readonly editingVariant = signal<ProductVariant | null>(null);
  readonly isImageManagerOpen = signal(false);
  readonly selectedVariantForImages = signal<ProductVariant | null>(null);

  // Icons
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Edit = SquarePen;
  readonly Save = Save;
  readonly Star = Star;
  readonly X = X;
  readonly ImageIcon = ImageIcon;
  readonly Archive = Archive;
  readonly CheckCircle = CircleCheckBig;
  readonly Package = Package;

  // --- Forms ---

  readonly variantForm = this.fb.group({
    sku: ['', [Validators.required, Validators.maxLength(80)]],
    gtin: [''],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    initialOnHand: [0, [Validators.min(0)]],
  });

  // --- Actions ---

  openCreateForm() {
    this.editingVariant.set(null);
    this.variantForm.reset({ initialOnHand: 0 });
    this.variantForm.get('initialOnHand')?.enable();
    this.isFormOpen.set(true);
  }

  openEditForm(variant: ProductVariant) {
    this.editingVariant.set(variant);
    this.variantForm.patchValue({
      sku: variant.sku,
      gtin: variant.gtin,
      name: variant.name,
      initialOnHand: variant.inventory?.onHand ?? 0,
    });
    // initialOnHand cannot be updated via updateVariant, so disable it
    this.variantForm.get('initialOnHand')?.disable();
    this.isFormOpen.set(true);
  }

  closeForm() {
    this.isFormOpen.set(false);
    this.editingVariant.set(null);
  }

  async saveVariant() {
    if (this.variantForm.invalid) return;

    const formValue = this.variantForm.value;

    if (this.editingVariant()) {
      // Update
      const payload: UpdateVariantPayload = {
        name: formValue.name!,
        sku: formValue.sku!,
        gtin: formValue.gtin || undefined,
      };
      await this.variantsService.updateVariantMutation.mutateAsync({
        variantId: this.editingVariant()!.id,
        payload,
      });
    } else {
      // Create
      const payload: CreateVariantPayload = {
        name: formValue.name!,
        sku: formValue.sku!,
        gtin: formValue.gtin || undefined,
        initialOnHand: formValue.initialOnHand ?? 0,
      };
      await this.variantsService.createVariantMutation.mutateAsync({
        productId: this.productId(),
        payload,
      });
    }
    this.closeForm();
  }

  confirmDelete(variant: ProductVariant) {
    if (confirm(`¿Estás seguro de eliminar la variante ${variant.name}?`)) {
      this.variantsService.deleteVariantMutation.mutate(variant.id);
    }
  }

  toggleActivation(variant: ProductVariant) {
    if (variant.isActive) {
      this.variantsService.deactivateVariantMutation.mutate(variant.id);
    } else {
      this.variantsService.activateVariantMutation.mutate(variant.id);
    }
  }

  // --- Image Management ---

  private readonly variantImagesQuery = injectQuery(() => ({
    queryKey: ['variant-images', this.selectedVariantForImages()?.id],
    queryFn: () => {
      const id = this.selectedVariantForImages()?.id;
      if (!id) return Promise.resolve([]);
      return this.variantsService.listImagesRequest(id);
    },
    enabled: !!this.selectedVariantForImages(),
  }));

  readonly variantImages = computed(() => {
    const images = this.variantImagesQuery.data() ?? [];
    return images.sort((a, b) => {
      // Default first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Then by date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });
  readonly isImagesLoading = computed(() => this.variantImagesQuery.isLoading());

  openImageManager(variant: ProductVariant) {
    this.selectedVariantForImages.set(variant);
    this.isImageManagerOpen.set(true);
  }

  closeImageManager() {
    this.isImageManagerOpen.set(false);
    this.selectedVariantForImages.set(null);
  }

  async uploadImage(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.selectedVariantForImages()) return;

    const file = input.files[0];
    await this.variantsService.uploadImageMutation.mutateAsync({
      variantId: this.selectedVariantForImages()!.id,
      payload: { file },
    });
    input.value = ''; // Reset input
  }

  deleteImage(imageId: string) {
    if (!this.selectedVariantForImages()) return;
    if (confirm('¿Eliminar imagen?')) {
      this.variantsService.deleteImageMutation.mutate({
        variantId: this.selectedVariantForImages()!.id,
        imageId,
      });
    }
  }

  setAsDefault(imageId: string) {
    if (!this.selectedVariantForImages()) return;
    this.variantsService.setDefaultImageMutation.mutate({
      variantId: this.selectedVariantForImages()!.id,
      imageId,
    });
  }
}
