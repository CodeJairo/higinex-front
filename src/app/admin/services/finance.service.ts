import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, defer, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

export interface DateRangeParams {
    from?: string; // ISO Date String
    to?: string;   // ISO Date String
}

export interface FinanceSummary {
    totalPaid: string;      // "150000.00"
    totalRefunded: string;  // "0.00"
    netRevenue: string;     // "150000.00"
    paymentsCount: number;
    refundsCount: number;
}

export interface PaymentRow {
    id: string;
    amount: string;         // Decimal string
    status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
    method: 'CARD' | 'CASH' | 'TRANSFER' | 'EXTERNAL_LINK' | 'OTHER';
    paidAt: string | null;  // ISO Date
    orderNumber: string;
    orderId: string;        // Added for linking
    customerName?: string;
    customerEmail?: string;
}

export interface RefundRow {
    id: string;
    amount: string;
    status: 'PENDING' | 'COMPLETED';
    processedAt: string | null;
    orderNumber: string;
    orderId: string;        // Added for linking
    customerName?: string;
}

export interface ListResponse<T> {
    data: T[];
    totalCount: number;
}

@Injectable({
    providedIn: 'root'
})
export class FinanceService {
    private http = inject(HttpClient);
    private authService = inject(AuthService); // Injected AuthService
    private baseUrl = environment.apiUrl; // Modified baseUrl

    private buildUrl(path: string): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}/finance${normalizedPath}`;
    }

    private unwrapResponse<T>(response: any): T {
        // This helper assumes the backend might wrap responses in a 'json' field,
        // but HttpClient typically unwraps JSON automatically.
        // It's kept as per instruction, but might be redundant depending on HttpClient's interceptors/defaults.
        return response?.json ? response.json : response;
    }

    getSummary(params: DateRangeParams): Observable<FinanceSummary> {
        let httpParams = new HttpParams();
        if (params.from) httpParams = httpParams.set('from', params.from);
        if (params.to) httpParams = httpParams.set('to', params.to);

        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<FinanceSummary>(this.buildUrl('/summary'), { headers, params: httpParams }).pipe(
                    map(res => this.unwrapResponse<FinanceSummary>(res))
                )
            )
        );
    }

    getPayments(params: any): Observable<ListResponse<PaymentRow>> {
        let httpParams = new HttpParams();

        if (params.from) httpParams = httpParams.set('from', params.from);
        if (params.to) httpParams = httpParams.set('to', params.to);
        if (params.limit) httpParams = httpParams.set('limit', params.limit);
        if (params.offset !== undefined && params.offset !== null) httpParams = httpParams.set('offset', params.offset);

        // Handle status and method only if they have valid values
        if (params.status && params.status !== 'undefined' && params.status !== 'null') {
            httpParams = httpParams.set('status', params.status);
        }
        if (params.method && params.method !== 'undefined' && params.method !== 'null') {
            httpParams = httpParams.set('method', params.method);
        }

        // Optional UUIDs if present (skipping 'q' as requested for payments)
        if (params.orderId) httpParams = httpParams.set('orderId', params.orderId);
        if (params.customerId) httpParams = httpParams.set('customerId', params.customerId);

        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<ListResponse<PaymentRow>>(this.buildUrl('/payments'), { headers, params: httpParams }).pipe(
                    map(res => this.unwrapResponse<ListResponse<PaymentRow>>(res))
                )
            )
        );
    }

    getRefunds(params: any): Observable<ListResponse<RefundRow>> {
        let httpParams = new HttpParams();

        if (params.from) httpParams = httpParams.set('from', params.from);
        if (params.to) httpParams = httpParams.set('to', params.to);
        if (params.limit) httpParams = httpParams.set('limit', params.limit);
        if (params.offset !== undefined && params.offset !== null) httpParams = httpParams.set('offset', params.offset);

        if (params.status && params.status !== 'undefined' && params.status !== 'null') {
            httpParams = httpParams.set('status', params.status);
        }

        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<ListResponse<RefundRow>>(this.buildUrl('/refunds'), { headers, params: httpParams }).pipe(
                    map(res => this.unwrapResponse<ListResponse<RefundRow>>(res))
                )
            )
        );
    }

    downloadInvoice(orderId: string): Observable<Blob> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get(this.buildUrl(`/invoices/${orderId}`), { headers, responseType: 'blob' })
            )
        );
    }

    generateReport(params: { type: 'payments' | 'refunds' | 'summary', format: 'csv' | 'pdf', from?: string, to?: string }): Observable<Blob> {
        let httpParams = new HttpParams({ fromObject: params as any });
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get(this.buildUrl('/report'), { headers, params: httpParams, responseType: 'blob' })
            )
        );
    }
}
