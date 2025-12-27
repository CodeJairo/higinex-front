import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import {
  ContractDetail,
  ContractItem,
  ContractItemInput,
  ContractSummary,
  ContractWithItems,
  CreateContractPayload,
  CustomerSummary,
  ListCustomersQuery,
  ListVariantsQuery,
  MessageResponse,
  UpdateContractPayload,
  Variant,
} from '../interfaces/contracts.interface';

@Injectable({ providedIn: 'root' })
export class ContractsService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

  listCustomers({ limit = 100, offset = 0, q }: ListCustomersQuery = {}): Observable<
    CustomerSummary[]
  > {
    const paramsObject: Record<string, string> = {
      limit: String(limit),
      offset: String(offset),
    };
    if (q) {
      paramsObject['q'] = q;
    }
    const params = new HttpParams({ fromObject: paramsObject });

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<CustomerSummary[]>(this.buildUrl('/customers'), { headers, params })
      )
    );
  }

  getCustomer(customerId: string): Observable<CustomerSummary> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<CustomerSummary>(this.buildUrl(`/customers/${customerId}`), { headers })
      )
    );
  }

  listCustomerContracts(customerId: string): Observable<ContractSummary[]> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<ContractSummary[]>(this.buildUrl(`/customers/${customerId}/contracts`), {
          headers,
        })
      )
    );
  }

  getContract(contractId: string): Observable<ContractDetail> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<ContractDetail>(this.buildUrl(`/contracts/${contractId}`), { headers })
      )
    );
  }

  createContract(
    customerId: string,
    payload: CreateContractPayload
  ): Observable<ContractWithItems> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.post<ContractWithItems>(this.buildUrl(`/contracts/${customerId}`), payload, {
          headers,
        })
      )
    );
  }

  updateContract(
    contractId: string,
    payload: UpdateContractPayload
  ): Observable<ContractWithItems> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.patch<ContractWithItems>(this.buildUrl(`/contracts/${contractId}`), payload, {
          headers,
        })
      )
    );
  }

  deleteContract(contractId: string): Observable<MessageResponse> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.delete<MessageResponse>(this.buildUrl(`/contracts/${contractId}`), { headers })
      )
    );
  }

  listContractItems(contractId: string): Observable<ContractItem[]> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<ContractItem[]>(this.buildUrl(`/contracts/${contractId}/items`), {
          headers,
        })
      )
    );
  }

  upsertContractItems(contractId: string, items: ContractItemInput[]): Observable<ContractItem[]> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.put<ContractItem[]>(
          this.buildUrl(`/contracts/${contractId}/items`),
          { items },
          {
            headers,
          }
        )
      )
    );
  }

  updateContractItem(
    contractId: string,
    variantId: string,
    unitPriceCop: number
  ): Observable<MessageResponse> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.patch<MessageResponse>(
          this.buildUrl(`/contracts/${contractId}/items/${variantId}`),
          { unitPriceCop },
          { headers }
        )
      )
    );
  }

  deleteContractItem(contractId: string, variantId: string): Observable<MessageResponse> {
    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.delete<MessageResponse>(
          this.buildUrl(`/contracts/${contractId}/items/${variantId}`),
          { headers }
        )
      )
    );
  }

  listVariants({
    limit = 100,
    offset = 0,
    status = 'active',
    productStatus = 'all',
  }: ListVariantsQuery = {}): Observable<Variant[]> {
    const params = new HttpParams({
      fromObject: {
        limit: String(limit),
        offset: String(offset),
        status,
        productStatus,
      },
    });

    return defer(() =>
      this.authService.requestWithAuthHeaders((headers) =>
        this.http.get<Variant[]>(this.buildUrl('/products/variants'), { headers, params })
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
}
