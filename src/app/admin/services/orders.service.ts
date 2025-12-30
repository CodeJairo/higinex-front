import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { defer, map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import {
    CancelOrderPayload,
    ConfirmPaymentPayload,
    CreateOrderNotePayload,
    CreateRefundPayload,
    CreateReturnPayload,
    CreateShipmentPayload,
    ExpireReservationsResponse,
    Order,
    OrderFilters,
    OrderListResponse,
    OrderNote,
    Payment,
    Refund,
    ReturnRequest,
    Shipment,
    UpdateOrderStatusPayload,
    UpdateRefundPayload,
    UpdateReturnPayload,
    UpdateShipmentPayload,
} from '../interfaces/orders.interface';

@Injectable({
    providedIn: 'root',
})
export class OrdersService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly queryClient = inject(QueryClient)
    private readonly baseUrl = environment.apiUrl;

    private buildUrl(path: string): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.baseUrl}${normalizedPath}`;
    }

    private unwrapResponse<T>(response: any): T {
        return response?.json ? response.json : response;
    }

    // 1) Listado de pedidos
    getOrders(filters: OrderFilters = {}): Observable<OrderListResponse | Order[]> {
        let params = new HttpParams();

        if (filters.limit) params = params.set('limit', String(filters.limit));
        if (filters.offset !== undefined) params = params.set('offset', String(filters.offset));
        if (filters.status && String(filters.status) !== 'undefined') params = params.set('status', filters.status);
        if (filters.customerId) params = params.set('customerId', filters.customerId);
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

    // 2) Detalle de pedido
    getOrder(orderId: string): Observable<Order> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}`), { headers }).pipe(
                    map(res => this.unwrapResponse<Order>(res))
                )
            )
        );
    }

    // Mutations
    public readonly createNoteMutation = injectMutation(() => ({
        mutationFn: ({ orderId, payload }: { orderId: string; payload: CreateOrderNotePayload }) =>
            this.createNoteRequest(orderId, payload),
        onSuccess: (_, variables) => {
            this.queryClient.invalidateQueries({ queryKey: ['order-notes', variables.orderId] });
        },
    }));

    public readonly updateStatusMutation = injectMutation(() => ({
        mutationFn: ({ orderId, payload }: { orderId: string; payload: UpdateOrderStatusPayload }) =>
            this.updateStatusRequest(orderId, payload),
        onSuccess: (_, variables) => {
            this.queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
            this.queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    }));

    // Helper Requests (returning Promise for mutationFn)
    private async createNoteRequest(orderId: string, payload: CreateOrderNotePayload): Promise<OrderNote> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.post<any>(this.buildUrl(`/orders/${orderId}/notes`), payload, { headers }).pipe(
                map(res => this.unwrapResponse<OrderNote>(res))
            )
        );
    }

    private async updateStatusRequest(orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.patch<any>(this.buildUrl(`/orders/${orderId}/status`), payload, { headers }).pipe(
                map(res => this.unwrapResponse<Order>(res))
            )
        );
    }

    // 3) Confirmar pago
    confirmPayment(orderId: string, payload: ConfirmPaymentPayload): Observable<Order> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.post<any>(this.buildUrl(`/orders/${orderId}/confirm-payment`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<Order>(res))
                )
            )
        );
    }

    // 4) Cancelar pedido
    cancelOrder(orderId: string, payload: CancelOrderPayload = {}): Observable<Order> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.post<any>(this.buildUrl(`/orders/${orderId}/cancel`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<Order>(res))
                )
            )
        );
    }

    // 6) Notas internas (Query)
    getNotes(orderId: string): Observable<OrderNote[]> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}/notes`), { headers }).pipe(
                    map(res => this.unwrapResponse<OrderNote[]>(res))
                )
            )
        );
    }

    deleteNote(orderId: string, noteId: string): Observable<{ message: string }> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.delete<{ message: string }>(this.buildUrl(`/orders/${orderId}/notes/${noteId}`), { headers })
            )
        );
    }

    // 7) Envíos (Shipments)
    getShipments(orderId: string): Observable<Shipment[]> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}/shipments`), { headers }).pipe(
                    map(res => this.unwrapResponse<Shipment[]>(res))
                )
            )
        );
    }

    createShipment(orderId: string, payload: CreateShipmentPayload): Observable<Shipment> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.post<any>(this.buildUrl(`/orders/${orderId}/shipments`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<Shipment>(res))
                )
            )
        );
    }

    updateShipment(orderId: string, shipmentId: string, payload: UpdateShipmentPayload): Observable<Shipment> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.patch<any>(this.buildUrl(`/orders/${orderId}/shipments/${shipmentId}`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<Shipment>(res))
                )
            )
        );
    }

    // 8) Pagos (read-only)
    getPayments(orderId: string): Observable<Payment[]> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}/payments`), { headers }).pipe(
                    map(res => this.unwrapResponse<Payment[]>(res))
                )
            )
        );
    }

    // 9) Devoluciones (Returns)
    getReturns(orderId: string): Observable<ReturnRequest[]> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}/returns`), { headers }).pipe(
                    map(res => this.unwrapResponse<ReturnRequest[]>(res))
                )
            )
        );
    }

    createReturn(orderId: string, payload: CreateReturnPayload): Observable<ReturnRequest> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.post<any>(this.buildUrl(`/orders/${orderId}/returns`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<ReturnRequest>(res))
                )
            )
        );
    }

    updateReturn(orderId: string, returnId: string, payload: UpdateReturnPayload): Observable<ReturnRequest> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.patch<any>(this.buildUrl(`/orders/${orderId}/returns/${returnId}`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<ReturnRequest>(res))
                )
            )
        );
    }

    // 10) Reembolsos (Refunds)
    getRefunds(orderId: string): Observable<Refund[]> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<any>(this.buildUrl(`/orders/${orderId}/refunds`), { headers }).pipe(
                    map(res => this.unwrapResponse<Refund[]>(res))
                )
            )
        );
    }

    createRefund(orderId: string, payload: CreateRefundPayload): Observable<Refund> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.post<any>(this.buildUrl(`/orders/${orderId}/refunds`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<Refund>(res))
                )
            )
        );
    }

    updateRefund(orderId: string, refundId: string, payload: UpdateRefundPayload): Observable<Refund> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.patch<any>(this.buildUrl(`/orders/${orderId}/refunds/${refundId}`), payload, { headers }).pipe(
                    map(res => this.unwrapResponse<Refund>(res))
                )
            )
        );
    }

    // 11) Expirar reservas (acción global)
    expireReservations(): Observable<ExpireReservationsResponse> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.post<any>(this.buildUrl('/orders/expire-reservations'), {}, { headers }).pipe(
                    map(res => this.unwrapResponse<ExpireReservationsResponse>(res))
                )
            )
        );
    }
}
