import { CommonModule } from '@angular/common';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  LucideAngularModule,
  Plus,
  Search,
  Tag,
  Trash2,
  Users,
  X,
} from 'lucide-angular';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { injectMutation, injectQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import {
  ContractItemInput,
  ContractSummary,
  ContractWithItems,
  CreateContractPayload,
  CustomerSummary,
  ListCustomersQuery,
  ListVariantsQuery,
  UpdateContractPayload,
} from '../../interfaces/contracts.interface';
import { ContractsService } from '../../services/contracts.service';

type CustomerContractStatus = 'active' | 'inactive' | 'unknown';

interface VariantPriceRow {
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
  attributesLabel: string;
  currentPrice: number | null;
  draftPrice: number | null;
  markedForDelete: boolean;
}

const DEFAULT_CUSTOMERS_QUERY: ListCustomersQuery = {
  limit: 100,
  offset: 0,
};

const VARIANTS_QUERY: ListVariantsQuery = {
  limit: 100,
  offset: 0,
  status: 'active',
  productStatus: 'all',
};

@Component({
  selector: 'app-contracts-page',
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './contracts-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsPage {
  private readonly authService = inject(AuthService);
  private readonly contractsService = inject(ContractsService);
  private readonly queryClient = inject(QueryClient);
  private readonly formBuilder = inject(FormBuilder);

  readonly selectedCustomerId = signal<string | null>(null);
  readonly selectedContractId = signal<string | null>(null);
  readonly customerSearch = signal('');
  readonly debouncedCustomerSearch = signal('');
  readonly pricesDraft = signal<Map<string, number>>(new Map());
  readonly pricesToDelete = signal<Set<string>>(new Set());
  readonly customerStatusById = signal<Map<string, CustomerContractStatus>>(new Map());
  readonly pendingContractDeleteId = signal<string | null>(null);
  readonly pendingPriceDeleteVariantId = signal<string | null>(null);

  // Icons
  readonly AlertCircle = AlertCircle;
  readonly AlertTriangle = AlertTriangle;
  readonly ArrowLeft = ArrowLeft;
  readonly Calendar = Calendar;
  readonly FileText = FileText;
  readonly Plus = Plus;
  readonly Search = Search;
  readonly Tag = Tag;
  readonly Trash2 = Trash2;
  readonly Users = Users;
  readonly X = X;

  private searchDebounceId: number | null = null;

  readonly createContractForm: FormGroup = this.formBuilder.group({
    startsAt: ['', Validators.required],
    endsAt: [''],
    isActive: [true],
  });

  readonly updateContractForm: FormGroup = this.formBuilder.group({
    startsAt: ['', Validators.required],
    endsAt: [''],
    isActive: [true],
  });

  readonly customerQuery = computed<ListCustomersQuery>(() => {
    const search = this.debouncedCustomerSearch().trim();
    if (search) {
      return {
        ...DEFAULT_CUSTOMERS_QUERY,
        q: search,
      };
    }
    return DEFAULT_CUSTOMERS_QUERY;
  });

  private readonly customersQuery = injectQuery(() => {
    const query = this.customerQuery();
    return {
      queryKey: ['admin', 'customers', query],
      queryFn: () => firstValueFrom(this.contractsService.listCustomers(query)),
      enabled: this.authService.isAuthenticated(),
      staleTime: 5 * 60 * 1000,
    };
  });

  private readonly contractsQuery = injectQuery(() => ({
    queryKey: ['admin', 'contracts', this.selectedCustomerId()],
    queryFn: () =>
      firstValueFrom(this.contractsService.listCustomerContracts(this.selectedCustomerId()!)),
    enabled: this.authService.isAuthenticated() && !!this.selectedCustomerId(),
    staleTime: 2 * 60 * 1000,
  }));

  private readonly contractItemsQuery = injectQuery(() => ({
    queryKey: ['admin', 'contractItems', this.selectedContractId()],
    queryFn: () =>
      firstValueFrom(this.contractsService.listContractItems(this.selectedContractId()!)),
    enabled: this.authService.isAuthenticated() && !!this.selectedContractId(),
    staleTime: 2 * 60 * 1000,
  }));

  private readonly variantsQuery = injectQuery(() => ({
    queryKey: ['admin', 'variants', VARIANTS_QUERY],
    queryFn: () => firstValueFrom(this.contractsService.listVariants(VARIANTS_QUERY)),
    enabled: this.authService.isAuthenticated(),
    staleTime: 5 * 60 * 1000,
  }));

  private readonly createContractMutation = injectMutation(() => ({
    mutationFn: (payload: { customerId: string; data: CreateContractPayload }) =>
      firstValueFrom(this.contractsService.createContract(payload.customerId, payload.data)),
    onSuccess: (contract: ContractWithItems, payload) => {
      this.selectedCustomerId.set(payload.customerId);
      this.selectedContractId.set(contract.id);
      this.resetPriceDrafts();
      this.updateContractsCache(payload.customerId, (current) =>
        this.mergeContractSummary(current, this.toContractSummary(contract), true)
      );
      this.queryClient.invalidateQueries({
        queryKey: ['admin', 'contracts', payload.customerId],
      });
      this.queryClient.invalidateQueries({
        queryKey: ['admin', 'contractItems', contract.id],
      });
    },
  }));

  private readonly updateContractMutation = injectMutation(() => ({
    mutationFn: (payload: { contractId: string; data: UpdateContractPayload }) =>
      firstValueFrom(this.contractsService.updateContract(payload.contractId, payload.data)),
    onSuccess: (contract: ContractWithItems, payload) => {
      const customerId = this.selectedCustomerId();
      if (customerId) {
        this.updateContractsCache(customerId, (current) =>
          this.mergeContractSummary(current, this.toContractSummary(contract), contract.isActive)
        );
        this.queryClient.invalidateQueries({
          queryKey: ['admin', 'contracts', customerId],
        });
      }
      this.queryClient.invalidateQueries({
        queryKey: ['admin', 'contractItems', payload.contractId],
      });
    },
  }));

  private readonly deleteContractMutation = injectMutation(() => ({
    mutationFn: (payload: { contractId: string; customerId: string }) =>
      firstValueFrom(this.contractsService.deleteContract(payload.contractId)),
    onSuccess: (_, payload) => {
      this.selectedContractId.set(null);
      this.resetPriceDrafts();
      this.updateContractsCache(payload.customerId, (current) =>
        (current ?? []).filter((contract) => contract.id !== payload.contractId)
      );
      this.queryClient.removeQueries({
        queryKey: ['admin', 'contractItems', payload.contractId],
      });
    },
  }));

  private readonly upsertItemsMutation = injectMutation(() => ({
    mutationFn: (payload: { contractId: string; items: ContractItemInput[] }) =>
      firstValueFrom(this.contractsService.upsertContractItems(payload.contractId, payload.items)),
    onSuccess: (_, payload) => {
      this.queryClient.invalidateQueries({
        queryKey: ['admin', 'contractItems', payload.contractId],
      });
    },
  }));

  private readonly deleteItemsMutation = injectMutation(() => ({
    mutationFn: (payload: { contractId: string; variantIds: string[] }) =>
      Promise.all(
        payload.variantIds.map((variantId) =>
          firstValueFrom(this.contractsService.deleteContractItem(payload.contractId, variantId))
        )
      ),
    onSuccess: (_, payload) => {
      this.queryClient.invalidateQueries({
        queryKey: ['admin', 'contractItems', payload.contractId],
      });
    },
  }));

  readonly customers = computed(() => this.customersQuery.data() ?? []);
  readonly isLoadingCustomers = computed(() => this.customersQuery.isLoading());
  readonly hasCustomersError = computed(() => this.customersQuery.isError());
  readonly selectedCustomer = computed<CustomerSummary | null>(() => {
    const id = this.selectedCustomerId();
    if (!id) {
      return null;
    }
    return this.customers().find((customer: CustomerSummary) => customer.id === id) ?? null;
  });
  readonly contractsForSelectedCustomer = computed(() => this.contractsQuery.data() ?? []);
  readonly isLoadingContracts = computed(() => this.contractsQuery.isLoading());
  readonly hasContractsError = computed(() => this.contractsQuery.isError());
  readonly variants = computed(() => this.variantsQuery.data() ?? []);
  readonly isLoadingVariants = computed(() => this.variantsQuery.isLoading());
  readonly hasVariantsError = computed(() => this.variantsQuery.isError());
  readonly contractItems = computed(() => this.contractItemsQuery.data() ?? []);
  readonly isLoadingContractItems = computed(() => this.contractItemsQuery.isLoading());
  readonly hasContractItemsError = computed(() => this.contractItemsQuery.isError());

  readonly selectedContract = computed<ContractSummary | null>(() => {
    const id = this.selectedContractId();
    if (!id) {
      return null;
    }
    return this.contractsForSelectedCustomer().find((contract: ContractSummary) => contract.id === id) ?? null;
  });

  readonly contractItemsByVariantId = computed(() => {
    return new Map(this.contractItems().map((item: any) => [item.variantId, item]));
  });

  readonly mergedVariantRows = computed<VariantPriceRow[]>(() => {
    const draft = this.pricesDraft();
    const deletes = this.pricesToDelete();
    const itemsByVariant = this.contractItemsByVariantId();

    return this.variants().map((variant: any) => {
      const currentPrice = itemsByVariant.get(variant.id)?.unitPriceCop ?? null;
      const draftPrice = draft.get(variant.id) ?? null;
      return {
        variantId: variant.id,
        sku: variant.sku,
        productName: variant.product.name,
        variantName: variant.name,
        attributesLabel: this.formatAttributes(variant.attributesJson),
        currentPrice,
        draftPrice,
        markedForDelete: deletes.has(variant.id),
      };
    });
  });

  readonly pendingPriceDeleteRow = computed(() => {
    const variantId = this.pendingPriceDeleteVariantId();
    if (!variantId) {
      return null;
    }
    return this.mergedVariantRows().find((row: VariantPriceRow) => row.variantId === variantId) ?? null;
  });

  readonly hasPriceChanges = computed(
    () => this.pricesDraft().size > 0 || this.pricesToDelete().size > 0
  );
  readonly isSavingPrices = computed(
    () => this.upsertItemsMutation.isPending() || this.deleteItemsMutation.isPending()
  );

  constructor() {
    effect(() => {
      const term = this.customerSearch();
      if (this.searchDebounceId !== null) {
        window.clearTimeout(this.searchDebounceId);
      }
      this.searchDebounceId = window.setTimeout(() => {
        this.debouncedCustomerSearch.set(term.trim());
      }, 300);
    });

    effect(() => {
      const customers = this.customers();
      const selected = this.selectedCustomerId();

      if (!customers.length) {
        if (selected) {
          this.selectedCustomerId.set(null);
          this.selectedContractId.set(null);
          this.resetPriceDrafts();
        }
        return;
      }

      if (!selected || !customers.some((customer: CustomerSummary) => customer.id === selected)) {
        this.onSelectCustomer(customers[0]);
      }
    });

    effect(() => {
      const customers = this.customers();
      if (!customers.length) {
        return;
      }
      this.customerStatusById.update((current) => {
        const next = new Map(current);
        for (const customer of customers) {
          if (!next.has(customer.id)) {
            next.set(customer.id, 'unknown');
          }
        }
        return next;
      });
    });

    effect(() => {
      const customerId = this.selectedCustomerId();
      if (!customerId) {
        return;
      }
      const contracts = this.contractsForSelectedCustomer();
      const status: CustomerContractStatus = contracts.some((contract: ContractSummary) => contract.isActive)
        ? 'active'
        : 'inactive';
      this.customerStatusById.update((current: Map<string, CustomerContractStatus>) => {
        const next = new Map(current);
        next.set(customerId, status);
        return next;
      });
    });

    effect(() => {
      const contracts = this.contractsForSelectedCustomer();
      const selectedId = this.selectedContractId();

      if (!contracts.length) {
        this.selectedContractId.set(null);
        return;
      }

      if (!selectedId || !contracts.some((contract: ContractSummary) => contract.id === selectedId)) {
        this.onSelectContract(contracts[0]);
      }
    });

    effect(() => {
      const contract = this.selectedContract();
      if (!contract) {
        this.updateContractForm.reset({
          startsAt: '',
          endsAt: '',
          isActive: true,
        });
        return;
      }

      this.updateContractForm.patchValue(
        {
          startsAt: this.toDateInput(contract.startsAt),
          endsAt: this.toDateInput(contract.endsAt),
          isActive: contract.isActive,
        },
        { emitEvent: false }
      );
    });
  }

  onSelectCustomer(customer: CustomerSummary): void {
    this.selectedCustomerId.set(customer.id);
    this.selectedContractId.set(null);
    this.resetPriceDrafts();
    this.createContractForm.reset({
      startsAt: '',
      endsAt: '',
      isActive: true,
    });
  }

  onCustomerSearch(value: string): void {
    this.customerSearch.set(value);
  }

  clearCustomerSearch(): void {
    if (this.searchDebounceId !== null) {
      window.clearTimeout(this.searchDebounceId);
      this.searchDebounceId = null;
    }
    this.customerSearch.set('');
    this.debouncedCustomerSearch.set('');
  }

  onSelectContract(contract: ContractSummary): void {
    this.selectedContractId.set(contract.id);
    this.resetPriceDrafts();
  }

  onPriceChange(variantId: string, value: string): void {
    const parsed = Number(value);
    const nextDraft = new Map(this.pricesDraft());
    const nextDeletes = new Set(this.pricesToDelete());
    const existing = this.contractItemsByVariantId().get(variantId);

    if (!value || Number.isNaN(parsed) || parsed < 0) {
      nextDraft.delete(variantId);
      if (existing) {
        nextDeletes.add(variantId);
      }
    } else {
      nextDraft.set(variantId, parsed);
      nextDeletes.delete(variantId);
    }

    this.pricesDraft.set(nextDraft);
    this.pricesToDelete.set(nextDeletes);
  }

  requestRemovePrice(variantId: string): void {
    this.pendingPriceDeleteVariantId.set(variantId);
  }

  cancelRemovePrice(): void {
    this.pendingPriceDeleteVariantId.set(null);
  }

  confirmRemovePrice(): void {
    const variantId = this.pendingPriceDeleteVariantId();
    if (!variantId) {
      return;
    }
    this.pendingPriceDeleteVariantId.set(null);
    this.markPriceForDelete(variantId);
  }

  private markPriceForDelete(variantId: string): void {
    const nextDraft = new Map(this.pricesDraft());
    const nextDeletes = new Set(this.pricesToDelete());
    nextDraft.delete(variantId);
    nextDeletes.add(variantId);
    this.pricesDraft.set(nextDraft);
    this.pricesToDelete.set(nextDeletes);
  }

  async onCreateContract(): Promise<void> {
    const customerId = this.selectedCustomerId();
    if (!customerId) {
      return;
    }

    if (this.createContractForm.invalid) {
      this.createContractForm.markAllAsTouched();
      return;
    }

    const payload = this.buildCreatePayload();
    await this.createContractMutation.mutateAsync({ customerId, data: payload });
  }

  async onSaveContract(): Promise<void> {
    const contractId = this.selectedContractId();
    if (!contractId) {
      return;
    }

    if (this.updateContractForm.invalid) {
      this.updateContractForm.markAllAsTouched();
      return;
    }

    const payload = this.buildUpdatePayload();
    await this.updateContractMutation.mutateAsync({ contractId, data: payload });
  }

  requestDeleteContract(): void {
    const contractId = this.selectedContractId();
    if (!contractId) {
      return;
    }
    this.pendingContractDeleteId.set(contractId);
  }

  cancelDeleteContract(): void {
    this.pendingContractDeleteId.set(null);
  }

  async confirmDeleteContract(): Promise<void> {
    const contractId = this.pendingContractDeleteId();
    const customerId = this.selectedCustomerId();
    if (!contractId || !customerId) {
      return;
    }

    await this.deleteContractMutation.mutateAsync({ contractId, customerId });
    this.pendingContractDeleteId.set(null);
  }

  async onSavePrices(): Promise<void> {
    const contractId = this.selectedContractId();
    if (!contractId) {
      return;
    }

    const items = this.buildContractItemsPayload();
    const deletes: string[] = Array.from(this.pricesToDelete());

    if (!items.length && !deletes.length) {
      return;
    }

    if (items.length) {
      await this.upsertItemsMutation.mutateAsync({ contractId, items });
    }

    if (deletes.length) {
      await this.deleteItemsMutation.mutateAsync({ contractId, variantIds: deletes });
    }

    this.resetPriceDrafts();
  }

  getCustomerStatusLabel(customerId: string): string {
    const status = this.customerStatusById().get(customerId) ?? 'unknown';
    if (status === 'active') {
      return 'Activo';
    }
    if (status === 'inactive') {
      return 'Sin contrato';
    }
    return 'Sin datos';
  }

  isCustomerStatusActive(customerId: string): boolean {
    return this.customerStatusById().get(customerId) === 'active';
  }

  isCustomerStatusInactive(customerId: string): boolean {
    return this.customerStatusById().get(customerId) === 'inactive';
  }

  formatDate(date?: string | null): string {
    if (!date) return 'Sin fecha';
    return date.slice(0, 10);
  }

  formatContractStatus(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  private resetPriceDrafts(): void {
    this.pricesDraft.set(new Map());
    this.pricesToDelete.set(new Set());
  }

  private updateContractsCache(
    customerId: string,
    updater: (current?: ContractSummary[]) => ContractSummary[]
  ): void {
    this.queryClient.setQueryData(['admin', 'contracts', customerId], updater);
  }

  private mergeContractSummary(
    current: ContractSummary[] | undefined,
    summary: ContractSummary,
    forceDeactivateOthers: boolean
  ): ContractSummary[] {
    const list = current ?? [];
    const next = list.map((contract) => {
      if (contract.id === summary.id) {
        return { ...contract, ...summary };
      }
      if (forceDeactivateOthers) {
        return { ...contract, isActive: false };
      }
      return contract;
    });

    if (!list.some((contract) => contract.id === summary.id)) {
      return [summary, ...next];
    }

    return next;
  }

  private toContractSummary(contract: ContractWithItems): ContractSummary {
    const itemsCount = Array.isArray(contract.items) ? contract.items.length : 0;
    return {
      id: contract.id,
      customerId: contract.customerId,
      isActive: contract.isActive,
      startsAt: contract.startsAt,
      endsAt: contract.endsAt,
      createdAt: contract.createdAt,
      updatedAt: contract.updatedAt,
      _count: {
        items: itemsCount,
      },
    };
  }

  private buildContractItemsPayload(): ContractItemInput[] {
    const items: ContractItemInput[] = [];
    const current = this.contractItemsByVariantId();

    this.pricesDraft().forEach((price: number, variantId: string) => {
      const currentPrice = current.get(variantId)?.unitPriceCop;
      if (currentPrice !== price) {
        items.push({ variantId, unitPriceCop: price });
      }
    });

    return items;
  }

  private buildCreatePayload(): CreateContractPayload {
    const raw = this.createContractForm.getRawValue();
    const payload: CreateContractPayload = {};

    const startsAt = this.normalizeDateInput(raw.startsAt as string);
    const endsAt = this.normalizeDateInput(raw.endsAt as string);

    if (startsAt) {
      payload.startsAt = startsAt;
    }
    if (endsAt) {
      payload.endsAt = endsAt;
    }

    return payload;
  }

  private buildUpdatePayload(): UpdateContractPayload {
    const raw = this.updateContractForm.getRawValue();
    const payload: UpdateContractPayload = {
      isActive: !!raw.isActive,
    };

    const startsAt = this.normalizeDateInput(raw.startsAt as string);
    const endsAt = this.normalizeDateInput(raw.endsAt as string);

    if (startsAt) {
      payload.startsAt = startsAt;
    }
    if (endsAt) {
      payload.endsAt = endsAt;
    }

    return payload;
  }

  private normalizeDateInput(value?: string | null): string | undefined {
    if (!value) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }

  private toDateInput(value?: string | null): string {
    if (!value) {
      return '';
    }
    return value.slice(0, 10);
  }

  private formatAttributes(attributes?: Record<string, string> | null): string {
    if (!attributes) return '';
    const entries = Object.entries(attributes).filter(
      ([, entryValue]) => entryValue !== null && entryValue !== undefined && entryValue !== ''
    );
    if (!entries.length) return '';
    return entries.map(([key, entryValue]) => `${key}: ${entryValue}`).join(', ');
  }
}
