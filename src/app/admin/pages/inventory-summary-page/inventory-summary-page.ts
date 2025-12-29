import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    inject,
    signal,
    ViewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    injectMutation,
    injectQuery,
    QueryClient,
} from '@tanstack/angular-query-experimental';
import {
    AlertCircle,
    AlertTriangle,
    ArrowRightLeft,
    Box,
    CheckCircle2,
    ChevronDown,
    ClipboardList,
    Filter,
    History,
    Info,
    Layers,
    LayoutDashboard,
    LucideAngularModule,
    Package,
    Plus,
    Search,
    Settings2,
    SlidersHorizontal,
    X,
} from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { InventoryAdjustmentPayload, InventoryBalance } from '../../interfaces/inventory.interface';
import { InventoryManagementService } from '../../services/inventory.service';

@Component({
    selector: 'app-inventory-summary-page',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        ReactiveFormsModule,
        LucideAngularModule,
    ],
    templateUrl: './inventory-summary-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorySummaryPage {
    private readonly inventoryService = inject(InventoryManagementService);
    private readonly queryClient = inject(QueryClient);
    private readonly fb = inject(FormBuilder);

    // Icons
    readonly icons = {
        Dashboard: LayoutDashboard,
        Package: Package,
        History: History,
        Search: Search,
        Filter: Filter,
        Sliders: SlidersHorizontal,
        ArrowRightLeft: ArrowRightLeft,
        CheckCircle: CheckCircle2,
        AlertCircle: AlertCircle,
        Info: Info,
        Box: Box,
        Layers: Layers,
        Plus: Plus,
        X: X,
        AlertTriangle: AlertTriangle,
        Settings: Settings2,
        ChevronDown: ChevronDown,
        Clipboard: ClipboardList
    };

    // Signals for state
    readonly searchQuery = signal<string>('');
    readonly limit = signal<number>(20);
    readonly offset = signal<number>(0);

    // Adjust Modal State
    @ViewChild('adjustModal') adjustModal!: ElementRef<HTMLDialogElement>;
    readonly selectedVariant = signal<InventoryBalance | null>(null);

    readonly adjustForm = this.fb.group({
        quantity: [0, [Validators.required, Validators.min(-1000000), Validators.max(1000000)]], // 0 validation custom
        reason: ['', [Validators.required, Validators.minLength(3)]],
        notes: [''],
    });

    // Queries
    readonly summaryQuery = injectQuery(() => ({
        queryKey: ['inventory', 'summary'],
        queryFn: () => firstValueFrom(this.inventoryService.getInventorySummary()),
        refetchInterval: 30000, // Refresh every 30s
    }));

    readonly balancesQuery = injectQuery(() => ({
        queryKey: ['inventory', 'balances', this.searchQuery(), this.limit(), this.offset()],
        queryFn: () =>
            firstValueFrom(this.inventoryService.getInventoryBalances(
                this.limit(),
                this.offset(),
                this.searchQuery()
            )),
    }));

    // Mutations
    readonly adjustMutation = injectMutation(() => ({
        mutationFn: (payload: InventoryAdjustmentPayload) =>
            firstValueFrom(this.inventoryService.adjustInventory(payload)),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: ['inventory'] });
            this.closeAdjustModal();
            // Show toast/notification logic here if available, or just rely on UI update
        },
    }));

    // Computed
    readonly balances = computed(() => this.balancesQuery.data() ?? []);
    readonly isLoading = computed(() => this.balancesQuery.isLoading());
    readonly hasMore = computed(() => (this.balancesQuery.data()?.length ?? 0) === this.limit());
    readonly isAdjusting = computed(() => this.adjustMutation.isPending());

    // Methods
    onSearch(event: Event): void {
        const value = (event.target as HTMLInputElement).value;
        this.searchQuery.set(value);
        this.offset.set(0); // Reset pagination on search
    }

    nextPage(): void {
        if (this.hasMore()) {
            this.offset.update((current) => current + this.limit());
        }
    }

    prevPage(): void {
        if (this.offset() > 0) {
            this.offset.update((current) => Math.max(0, current - this.limit()));
        }
    }

    openAdjustModal(variant: InventoryBalance): void {
        this.selectedVariant.set(variant);
        this.adjustForm.reset({ quantity: 0, reason: '', notes: '' });
        this.adjustModal.nativeElement.showModal();
    }

    closeAdjustModal(): void {
        this.adjustModal.nativeElement.close();
        this.selectedVariant.set(null);
    }

    async submitAdjustment(): Promise<void> {
        if (this.adjustForm.invalid || !this.selectedVariant()) return;

        const { quantity, reason, notes } = this.adjustForm.value;

        if (!quantity || quantity === 0) {
            // Manual simple validation since Angular Validators.required handles null/empty but we want to ban 0 specifically if needed, 
            // though typically adjustments can be generic. Requirement said "quantity != 0".
            return;
        }

        const payload: InventoryAdjustmentPayload = {
            variantId: this.selectedVariant()!.variantId,
            quantity: quantity!,
            reason: reason!,
            notes: notes || undefined,
        };

        try {
            await this.adjustMutation.mutateAsync(payload);
        } catch (error) {
            console.error('Adjustment failed', error);
            // Handle error state
        }
    }

    getAdjustmentType(): 'IN' | 'OUT' | 'NEUTRAL' {
        const qty = this.adjustForm.get('quantity')?.value || 0;
        if (qty > 0) return 'IN';
        if (qty < 0) return 'OUT';
        return 'NEUTRAL';
    }
}
