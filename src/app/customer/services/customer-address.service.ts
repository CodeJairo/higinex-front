import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { DemoService } from '../../shared/services/demo.service';
import {
    CreateCustomerAddressPayload,
    CustomerAddress,
    ListCustomerAddressesQuery,
    MessageResponse,
    UpdateCustomerAddressPayload,
} from '../interfaces/customer-address.interface';

@Injectable({ providedIn: 'root' })
export class CustomerAddressService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly demoService = inject(DemoService);
    private readonly queryClient = inject(QueryClient);
    private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

    // Signals for loading/error states
    private readonly createErrorSignal = signal<string | null>(null);
    private readonly updateErrorSignal = signal<string | null>(null);
    private readonly deleteErrorSignal = signal<string | null>(null);
    private readonly setDefaultErrorSignal = signal<string | null>(null);

    // Readonly signals for consumers
    readonly createError = this.createErrorSignal.asReadonly();
    readonly updateError = this.updateErrorSignal.asReadonly();
    readonly deleteError = this.deleteErrorSignal.asReadonly();
    readonly setDefaultError = this.setDefaultErrorSignal.asReadonly();

    // Mutations
    private readonly createMutation = injectMutation(() => ({
        mutationFn: (payload: CreateCustomerAddressPayload) => this.createAddressRequest(payload),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
        },
        onError: (error) => {
            this.createErrorSignal.set(this.mapError(error));
        },
    }));

    private readonly updateMutation = injectMutation(() => ({
        mutationFn: (args: { id: string; payload: UpdateCustomerAddressPayload }) =>
            this.updateAddressRequest(args.id, args.payload),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
        },
        onError: (error) => {
            this.updateErrorSignal.set(this.mapError(error));
        },
    }));

    private readonly deleteMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.deleteAddressRequest(id),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
        },
        onError: (error) => {
            this.deleteErrorSignal.set(this.mapError(error));
        },
    }));

    private readonly setDefaultMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.setDefaultAddressRequest(id),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
        },
        onError: (error) => {
            this.setDefaultErrorSignal.set(this.mapError(error));
        },
    }));

    // Computed Loading States
    readonly isCreating = computed(() => this.createMutation.isPending());
    readonly isUpdating = computed(() => this.updateMutation.isPending());
    readonly isDeleting = computed(() => this.deleteMutation.isPending());
    readonly isSettingDefault = computed(() => this.setDefaultMutation.isPending());

    // === Public Methods ===

    /**
     * Listar direcciones del cliente authenticado.
     * Ordenado por backend: isDefault DESC, createdAt DESC.
     */
    listAddresses(params: ListCustomerAddressesQuery = {}): Promise<CustomerAddress[]> {
        // In demo mode, return addresses from sessionStorage
        if (this.demoService.isDemoMode()) {
            return Promise.resolve(this.demoService.getDemoAddresses());
        }

        const httpParams = new HttpParams({
            fromObject: {
                limit: String(params.limit ?? 10),
                offset: String(params.offset ?? 0),
            },
        });

        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.get<CustomerAddress[]>(this.buildUrl('/customers/me/addresses'), {
                headers,
                params: httpParams,
            })
        );
    }

    async createAddress(payload: CreateCustomerAddressPayload): Promise<boolean> {
        this.createErrorSignal.set(null);

        // In demo mode, create address locally
        if (this.demoService.isDemoMode()) {
            const newAddress: CustomerAddress = {
                id: crypto.randomUUID(),
                ...payload,
                isDefault: payload.isDefault ?? false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            this.demoService.addDemoAddress(newAddress);
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
            return true;
        }

        try {
            await this.createMutation.mutateAsync(payload);
            return true;
        } catch {
            return false;
        }
    }

    async updateAddress(id: string, payload: UpdateCustomerAddressPayload): Promise<boolean> {
        this.updateErrorSignal.set(null);

        // In demo mode, update address locally
        if (this.demoService.isDemoMode()) {
            this.demoService.updateDemoAddress(id, {
                ...payload,
                updatedAt: new Date().toISOString(),
            });
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
            return true;
        }

        try {
            await this.updateMutation.mutateAsync({ id, payload });
            return true;
        } catch {
            return false;
        }
    }

    async deleteAddress(id: string): Promise<boolean> {
        this.deleteErrorSignal.set(null);

        // In demo mode, delete address locally
        if (this.demoService.isDemoMode()) {
            this.demoService.deleteDemoAddress(id);
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
            return true;
        }

        try {
            await this.deleteMutation.mutateAsync(id);
            return true;
        } catch {
            return false;
        }
    }

    async setDefaultAddress(id: string): Promise<boolean> {
        this.setDefaultErrorSignal.set(null);

        // In demo mode, set default locally
        if (this.demoService.isDemoMode()) {
            this.demoService.setDemoDefaultAddress(id);
            this.queryClient.invalidateQueries({ queryKey: ['customer-addresses'] });
            return true;
        }

        try {
            await this.setDefaultMutation.mutateAsync(id);
            return true;
        } catch {
            return false;
        }
    }

    clearErrors(): void {
        this.createErrorSignal.set(null);
        this.updateErrorSignal.set(null);
        this.deleteErrorSignal.set(null);
        this.setDefaultErrorSignal.set(null);
    }

    // === Private Request Implementations ===

    private createAddressRequest(payload: CreateCustomerAddressPayload): Promise<CustomerAddress> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.post<CustomerAddress>(this.buildUrl('/customers/me/addresses'), payload, {
                headers,
            })
        );
    }

    private updateAddressRequest(
        id: string,
        payload: UpdateCustomerAddressPayload
    ): Promise<MessageResponse> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.patch<MessageResponse>(
                this.buildUrl(`/customers/me/addresses/${id}`),
                payload,
                { headers }
            )
        );
    }

    private deleteAddressRequest(id: string): Promise<MessageResponse> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.delete<MessageResponse>(this.buildUrl(`/customers/me/addresses/${id}`), {
                headers,
            })
        );
    }

    private setDefaultAddressRequest(id: string): Promise<MessageResponse> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.patch<MessageResponse>(
                this.buildUrl(`/customers/me/addresses/${id}/default`),
                {},
                { headers }
            )
        );
    }

    private buildUrl(path: string): string {
        if (!this.apiBaseUrl) {
            return path;
        }
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.apiBaseUrl}${normalizedPath}`;
    }

    private mapError(error: unknown): string {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 404) {
                return 'Dirección no encontrada.';
            }
            if (error.status === 400) {
                // Puede ser "Customer profile not found" u otros errores de validación
                return 'Datos inválidos o perfil de cliente no encontrado.';
            }
            if (error.status === 0) {
                return 'No se pudo conectar con el servidor.';
            }
        }
        return 'Ocurrió un error inesperado al procesar la solicitud.';
    }
}
