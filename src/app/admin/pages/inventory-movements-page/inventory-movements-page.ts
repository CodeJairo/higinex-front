import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
    injectQuery,
    QueryClient,
} from '@tanstack/angular-query-experimental';
import {
    ArrowLeft,
    ArrowRight,
    Calendar,
    Filter,
    History,
    Info,
    Layers,
    LayoutDashboard,
    LucideAngularModule,
    RefreshCw,
    Search,
    X,
} from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { InventoryManagementService } from '../../services/inventory.service';

@Component({
    selector: 'app-inventory-movements-page',
    standalone: true,
    imports: [CommonModule, FormsModule, LucideAngularModule],
    templateUrl: './inventory-movements-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryMovementsPage {
    private readonly inventoryService = inject(InventoryManagementService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);

    // Icons
    readonly icons = {
        Dashboard: LayoutDashboard,
        Layers: Layers,
        History: History,
        Filter: Filter,
        Search: Search,
        Calendar: Calendar,
        Refresh: RefreshCw,
        Info: Info,
        ArrowLeft: ArrowLeft,
        ArrowRight: ArrowRight,
        X: X
    };

    // Filter Signals
    readonly filterVariantId = signal<string>('');
    readonly filterOrderId = signal<string>('');
    readonly filterType = signal<'IN' | 'OUT' | 'SOLD' | 'RESERVED' | 'UNRESERVED' | 'ADJUSTMENT' | ''>('');
    readonly filterDateFrom = signal<string>(''); // YYYY-MM-DD
    readonly filterDateTo = signal<string>('');

    // Pagination Signals
    readonly limit = signal<number>(20);
    readonly offset = signal<number>(0);

    constructor() {
        // Read query params for initial filters
        this.route.queryParams.subscribe((params) => {
            if (params['variantId']) this.filterVariantId.set(params['variantId']);
            if (params['orderId']) this.filterOrderId.set(params['orderId']);
        });
    }

    // Query
    readonly movementsQuery = injectQuery(() => ({
        queryKey: [
            'inventory',
            'movements',
            this.limit(),
            this.offset(),
            this.filterVariantId(),
            this.filterOrderId(),
            this.filterType(),
            this.filterDateFrom(),
            this.filterDateTo(),
        ],
        queryFn: () => firstValueFrom(this.inventoryService.getInventoryMovements(
            this.limit(),
            this.offset(),
            {
                variantId: this.filterVariantId() || undefined,
                orderId: this.filterOrderId() || undefined,
                type: this.filterType() || undefined,
                dateFrom: this.filterDateFrom() || undefined,
                dateTo: this.filterDateTo() || undefined,
            }
        )),
    }));

    // Computed
    readonly movements = computed(() => this.movementsQuery.data() ?? []);
    readonly hasMore = computed(() => (this.movements().length === this.limit()));
    readonly isLoading = computed(() => this.movementsQuery.isPending());
    readonly isFetching = computed(() => this.movementsQuery.isFetching());

    // Methods
    clearFilters(): void {
        this.filterVariantId.set('');
        this.filterOrderId.set('');
        this.filterType.set('');
        this.filterDateFrom.set('');
        this.filterDateTo.set('');
        this.offset.set(0);

        // Clear URL params
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
        });
    }

    nextPage(): void {
        if (this.hasMore()) {
            this.offset.update((c) => c + this.limit());
        }
    }

    prevPage(): void {
        if (this.offset() > 0) {
            this.offset.update((c) => Math.max(0, c - this.limit()));
        }
    }

    // Helpers for UI
    getTypeLabel(type: string, reason: string) {
        switch (type) {
            case 'IN':
                return { label: 'Entrada', class: 'badge-success', icon: 'arrow-down' };
            case 'OUT':
                return { label: 'Salida', class: 'badge-error', icon: 'arrow-up' };
            case 'SOLD':
                return { label: 'Venta', class: 'badge-primary', icon: 'shopping-cart' }; // Using primary for sales
            case 'RESERVED':
                return { label: 'Reservado', class: 'badge-warning', icon: 'lock' };
            case 'UNRESERVED':
                return { label: 'Liberado', class: 'badge-info', icon: 'unlock' };
            case 'ADJUSTMENT':
                return { label: 'Ajuste', class: 'badge-neutral', icon: 'settings' };
            default:
                return { label: type, class: 'badge-ghost', icon: 'circle' };
        }
    }
}
