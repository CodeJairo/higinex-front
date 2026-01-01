import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, OrderFilters, OrderListResponse } from '../../admin/interfaces/orders.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class CustomerOrdersService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly baseUrl = environment.apiUrl;

    private buildUrl(path: string): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}${normalizedPath}`;
    }

    private unwrapResponse<T>(response: any): T {
        return response?.json ? response.json : response;
    }

    getOrders(filters: OrderFilters = {}): Observable<OrderListResponse | Order[]> {
        let params = new HttpParams();

        if (filters.limit) params = params.set('limit', String(filters.limit));
        if (filters.offset !== undefined) params = params.set('offset', String(filters.offset));
        if (filters.status && String(filters.status) !== 'undefined') params = params.set('status', filters.status);
        if (filters.orderNumber) params = params.set('orderNumber', filters.orderNumber);
        if (filters.q) params = params.set('q', filters.q);
        if (filters.dateFrom) params = params.set('dateFrom', filters.dateFrom);
        if (filters.dateTo) params = params.set('dateTo', filters.dateTo);
        if (filters.includeCount) params = params.set('includeCount', filters.includeCount || 'true');

        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl('/orders'), { headers, params }).pipe(
                    map(res => this.unwrapResponse<OrderListResponse | Order[]>(res))
                )
            )
        );
    }

    getOrder(orderId: string): Observable<Order> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}`), { headers }).pipe(
                    map(res => this.unwrapResponse<Order>(res))
                )
            )
        );
    }
}
