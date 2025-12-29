import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import {
  AlertCircle,
  AlertTriangle,
  Archive,
  CheckCircle,
  LucideAngularModule,
  Package,
  PackageOpen,
  Plus,
  Search,
  Settings,
  UploadCloud,
  X,
} from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { Product } from '../../interfaces/products.interface';
import { InventoryManagementService } from '../../services/inventory.service';

const PRODUCTS_QUERY = {
  limit: 100,
  offset: 0,
  status: 'ALL',
} as const;

const PRODUCTS_QUERY_KEY = ['inventory', 'products', PRODUCTS_QUERY] as const;

@Component({
  selector: 'app-inventory-products-page',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, RouterLink],
  templateUrl: './inventory-products-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryProductsPage implements OnInit {
  private readonly inventoryService = inject(InventoryManagementService);
  private readonly router = inject(Router);
  private readonly queryClient = inject(QueryClient);

  readonly selectedProduct = signal<Product | null>(null);
  readonly actionMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  readonly publishingProductId = signal<string | null>(null);
  readonly archivingProductId = signal<string | null>(null);

  // Icons
  readonly AlertCircle = AlertCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly Archive = Archive;
  readonly CheckCircle = CheckCircle;
  readonly Package = Package;
  readonly PackageOpen = PackageOpen;
  readonly Search = Search;
  readonly UploadCloud = UploadCloud;
  readonly X = X;
  readonly Settings = Settings;
  readonly Plus = Plus;

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
    onMutate: (productId: string) => {
      this.actionMessage.set(null);
      this.publishingProductId.set(productId);
    },
    onSuccess: (updated) => {
      this.updateProductCache(updated);
      this.actionMessage.set({ type: 'success', text: 'Producto publicado.' });
    },
    onError: () => {
      this.actionMessage.set({ type: 'error', text: 'No se pudo publicar el producto.' });
    },
    onSettled: () => {
      this.publishingProductId.set(null);
    },
  }));

  private readonly archiveProductMutation = injectMutation(() => ({
    mutationFn: (productId: string) =>
      firstValueFrom(this.inventoryService.archiveProduct(productId)),
    onMutate: (productId: string) => {
      this.actionMessage.set(null);
      this.archivingProductId.set(productId);
    },
    onSuccess: (updated) => {
      this.updateProductCache(updated);
      this.actionMessage.set({ type: 'success', text: 'Producto archivado.' });
    },
    onError: () => {
      this.actionMessage.set({ type: 'error', text: 'No se pudo archivar el producto.' });
    },
    onSettled: () => {
      this.archivingProductId.set(null);
    },
  }));

  readonly isLoading = computed(() => this.productsQuery.isLoading());
  readonly isError = computed(() => this.productsQuery.isError());

  ngOnInit(): void { }

  get products(): Product[] {
    return this.productsQuery.data() ?? [];
  }

  onManageVariants(product: Product): void {
    this.router.navigateByUrl(`/admin/inventory/variants/${product.id}`);
  }

  onPublish(product: Product): void {
    this.publishProductMutation.mutate(product.id);
  }

  onArchive(product: Product): void {
    this.archiveProductMutation.mutate(product.id);
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

  onCreateProduct(): void {
    this.router.navigateByUrl('/admin/inventory/create-product');
  }

  dismissActionMessage(): void {
    this.actionMessage.set(null);
  }

  isPublishing(productId: string): boolean {
    return this.publishProductMutation.isPending() && this.publishingProductId() === productId;
  }

  isArchiving(productId: string): boolean {
    return this.archiveProductMutation.isPending() && this.archivingProductId() === productId;
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
}
