import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface CustomerSummary {
  id: string;
  name: string;
  email: string;
  documentType: string;
  documentNumber: string;
}

interface ContractSummary {
  id: string;
  customerId: string;
  isActive: boolean;
  startsAt: string;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    items: number;
  };
}

interface ContractItem {
  id: string;
  variantId: string;
  unitPriceCop: number;
  createdAt: string;
  updatedAt: string;
}

interface Variant {
  id: string;
  productId: string;
  sku: string;
  gtin?: string | null;
  name: string;
  attributesJson?: Record<string, string> | null;
  product: {
    id: string;
    name: string;
    slug: string;
    status: 'PUBLISHED' | 'ARCHIVED';
  };
}

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

// =======================
// MOCKS / EJEMPLOS FALSOS
// =======================

const MOCK_CUSTOMERS: CustomerSummary[] = [
  {
    id: 'c1',
    name: 'Acme SAS',
    email: 'compras@acme.com',
    documentType: 'NIT',
    documentNumber: '900123456-7',
  },
  {
    id: 'c2',
    name: 'Distribuciones Beta',
    email: 'compras@beta.com',
    documentType: 'NIT',
    documentNumber: '901234567-8',
  },
];

const MOCK_CONTRACTS: ContractSummary[] = [
  {
    id: 'ct1',
    customerId: 'c1',
    isActive: true,
    startsAt: '2025-01-01T00:00:00.000Z',
    endsAt: null,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    _count: {
      items: 35,
    },
  },
  {
    id: 'ct2',
    customerId: 'c1',
    isActive: false,
    startsAt: '2024-01-01T00:00:00.000Z',
    endsAt: '2024-12-31T23:59:59.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-12-31T23:59:59.000Z',
    _count: {
      items: 20,
    },
  },
  {
    id: 'ct3',
    customerId: 'c2',
    isActive: true,
    startsAt: '2025-02-01T00:00:00.000Z',
    endsAt: null,
    createdAt: '2025-02-01T00:00:00.000Z',
    updatedAt: '2025-02-02T00:00:00.000Z',
    _count: {
      items: 10,
    },
  },
];

const MOCK_VARIANTS: Variant[] = [
  {
    id: 'v1',
    productId: 'p1',
    sku: 'TSHIRT-PREM-NEG-S',
    gtin: '7701234567001',
    name: 'Negro / S',
    attributesJson: { color: 'Negro', talla: 'S' },
    product: {
      id: 'p1',
      name: 'Camiseta Premium',
      slug: 'camiseta-premium',
      status: 'PUBLISHED',
    },
  },
  {
    id: 'v2',
    productId: 'p1',
    sku: 'TSHIRT-PREM-NEG-M',
    gtin: '7701234567002',
    name: 'Negro / M',
    attributesJson: { color: 'Negro', talla: 'M' },
    product: {
      id: 'p1',
      name: 'Camiseta Premium',
      slug: 'camiseta-premium',
      status: 'PUBLISHED',
    },
  },
  {
    id: 'v3',
    productId: 'p1',
    sku: 'TSHIRT-PREM-BLA-M',
    gtin: '7701234567003',
    name: 'Blanco / M',
    attributesJson: { color: 'Blanco', talla: 'M' },
    product: {
      id: 'p1',
      name: 'Camiseta Premium',
      slug: 'camiseta-premium',
      status: 'PUBLISHED',
    },
  },
];

const MOCK_CONTRACT_ITEMS_BY_CONTRACT: Record<string, ContractItem[]> = {
  ct1: [
    {
      id: 'ci1',
      variantId: 'v1',
      unitPriceCop: 45000,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
    {
      id: 'ci2',
      variantId: 'v2',
      unitPriceCop: 47000,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z',
    },
  ],
  ct2: [
    {
      id: 'ci3',
      variantId: 'v1',
      unitPriceCop: 42000,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-06-01T00:00:00.000Z',
    },
  ],
  ct3: [
    {
      id: 'ci4',
      variantId: 'v3',
      unitPriceCop: 49000,
      createdAt: '2025-02-01T00:00:00.000Z',
      updatedAt: '2025-02-02T00:00:00.000Z',
    },
  ],
};

const INITIAL_CUSTOMER_ID = MOCK_CUSTOMERS[0]?.id ?? null;
const INITIAL_CONTRACT_ID =
  MOCK_CONTRACTS.find((c) => c.customerId === INITIAL_CUSTOMER_ID)?.id ?? null;

@Component({
  selector: 'app-contracts-page',
  imports: [ReactiveFormsModule],
  templateUrl: './contracts-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContractsPage {
  private readonly fb = inject(FormBuilder);

  // Estado base (mocks)
  readonly customers = signal<CustomerSummary[]>(MOCK_CUSTOMERS);
  readonly allContracts = signal<ContractSummary[]>(MOCK_CONTRACTS);
  readonly allVariants = signal<Variant[]>(MOCK_VARIANTS);
  readonly contractItems = signal<ContractItem[]>(
    INITIAL_CONTRACT_ID ? MOCK_CONTRACT_ITEMS_BY_CONTRACT[INITIAL_CONTRACT_ID] ?? [] : []
  );

  // Estado de seleccion
  readonly selectedCustomerId = signal<string | null>(INITIAL_CUSTOMER_ID);
  readonly selectedContractId = signal<string | null>(INITIAL_CONTRACT_ID);

  // Borrador de precios: variantId -> unitPriceCop
  readonly pricesDraft = signal<Map<string, number>>(new Map());
  readonly pricesToDelete = signal<Set<string>>(new Set());

  // Forms separados para crear y editar
  readonly createContractForm: FormGroup = this.fb.group({
    startsAt: ['', Validators.required],
    endsAt: [''],
    isActive: [true],
  });

  readonly updateContractForm: FormGroup = this.fb.group({
    startsAt: ['', Validators.required],
    endsAt: [''],
    isActive: [true],
  });

  // Computados

  readonly selectedCustomer = computed(() => {
    const id = this.selectedCustomerId();
    return this.customers().find((c) => c.id === id) ?? null;
  });

  readonly activeContractByCustomerId = computed(() => {
    const map = new Map<string, ContractSummary>();
    for (const contract of this.allContracts()) {
      if (contract.isActive) {
        map.set(contract.customerId, contract);
      }
    }
    return map;
  });

  readonly contractsForSelectedCustomer = computed(() => {
    const customerId = this.selectedCustomerId();
    if (!customerId) return [];
    return this.allContracts().filter((c) => c.customerId === customerId);
  });

  readonly selectedContract = computed(() => {
    const id = this.selectedContractId();
    if (!id) return null;
    return this.allContracts().find((c) => c.id === id) ?? null;
  });

  readonly contractItemsByVariantId = computed(() => {
    return new Map(this.contractItems().map((item) => [item.variantId, item]));
  });

  // Variantes + precios (base + contrato + draft)
  readonly mergedVariantRows = computed<VariantPriceRow[]>(() => {
    const variants = this.allVariants();
    const draft = this.pricesDraft();
    const deletes = this.pricesToDelete();
    const itemsByVariant = this.contractItemsByVariantId();

    return variants.map((variant) => {
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

  // Metodos de UI (solo afectan mocks / estado local)

  onSelectCustomer(customer: CustomerSummary): void {
    this.selectedCustomerId.set(customer.id);

    const firstForCustomer = this.allContracts().find((c) => c.customerId === customer.id);
    this.selectedContractId.set(firstForCustomer?.id ?? null);

    this.pricesDraft.set(new Map());
    this.pricesToDelete.set(new Set());
    this.contractItems.set(
      firstForCustomer ? MOCK_CONTRACT_ITEMS_BY_CONTRACT[firstForCustomer.id] ?? [] : []
    );

    if (firstForCustomer) {
      this.updateContractForm.patchValue({
        startsAt: firstForCustomer.startsAt.slice(0, 10),
        endsAt: firstForCustomer.endsAt ? firstForCustomer.endsAt.slice(0, 10) : '',
        isActive: firstForCustomer.isActive,
      });
    } else {
      this.updateContractForm.reset({
        startsAt: '',
        endsAt: '',
        isActive: true,
      });
    }
  }

  onSelectContract(contract: ContractSummary): void {
    this.selectedContractId.set(contract.id);
    this.updateContractForm.patchValue({
      startsAt: contract.startsAt.slice(0, 10),
      endsAt: contract.endsAt ? contract.endsAt.slice(0, 10) : '',
      isActive: contract.isActive,
    });
    this.pricesDraft.set(new Map());
    this.pricesToDelete.set(new Set());
    this.contractItems.set(MOCK_CONTRACT_ITEMS_BY_CONTRACT[contract.id] ?? []);
  }

  onPriceChange(variantId: string, value: string): void {
    const parsed = Number(value);
    const copy = new Map(this.pricesDraft());
    const deletes = new Set(this.pricesToDelete());
    const existing = this.contractItemsByVariantId().get(variantId);
    if (!value || isNaN(parsed) || parsed < 0) {
      copy.delete(variantId);
      if (existing) {
        deletes.add(variantId);
      }
    } else {
      copy.set(variantId, parsed);
      deletes.delete(variantId);
    }
    this.pricesDraft.set(copy);
    this.pricesToDelete.set(deletes);
  }

  onClearPrice(variantId: string): void {
    const copy = new Map(this.pricesDraft());
    const deletes = new Set(this.pricesToDelete());
    copy.delete(variantId);
    deletes.add(variantId);
    this.pricesDraft.set(copy);
    this.pricesToDelete.set(deletes);
  }

  onFakeSaveContract(): void {
    if (this.updateContractForm.invalid || !this.selectedContract()) return;
    console.log('Guardar contrato (demo):', this.updateContractForm.value);
  }

  onFakeDeleteContract(): void {
    if (!this.selectedContract()) return;
    console.log('Eliminar contrato (demo):', this.selectedContract());
  }

  onFakeCreateContract(): void {
    if (this.createContractForm.invalid || !this.selectedCustomer()) return;
    console.log('Crear contrato (demo):', {
      customerId: this.selectedCustomer()?.id,
      form: this.createContractForm.value,
    });
  }

  onFakeSavePrices(): void {
    const contract = this.selectedContract();
    if (!contract) return;

    const items: { variantId: string; unitPriceCop: number }[] = [];
    this.pricesDraft().forEach((price, variantId) => {
      items.push({ variantId, unitPriceCop: price });
    });

    console.log('Guardar precios (demo): contrato', contract.id, 'items', items);
    console.log(
      'Eliminar precios (demo): contrato',
      contract.id,
      'variants',
      Array.from(this.pricesToDelete())
    );
  }

  // Helpers de UI

  formatDate(date?: string | null): string {
    if (!date) return 'Sin fecha';
    return date.slice(0, 10);
  }

  formatContractStatus(isActive: boolean): string {
    return isActive ? 'Activo' : 'Inactivo';
  }

  private formatAttributes(attributes?: Record<string, string> | null): string {
    if (!attributes) return '';
    const entries = Object.entries(attributes).filter(
      ([, value]) => value !== null && value !== undefined && value !== ''
    );
    if (!entries.length) return '';
    return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
  }
}
