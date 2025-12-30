import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { Order, OrderFilters, OrderStatus } from '../../interfaces/orders.interface';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'app-orders-list-page',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './orders-list-page.html',
})
export class OrdersListPage {
    private readonly ordersService = inject(OrdersService);
    private readonly router = inject(Router);

    // State
    filters = signal<OrderFilters>({
        limit: 10,
        offset: 0,
        includeCount: 'true',
        status: undefined,
        q: '',
    });

    // Query
    ordersQuery = injectQuery(() => ({
        queryKey: ['orders', this.filters()],
        queryFn: () => lastValueFrom(this.ordersService.getOrders(this.filters())),
    }));

    // Enums for template
    OrderStatus = OrderStatus;
    statusOptions = Object.values(OrderStatus);

    // Global Actions
    expireReservationsMutation = injectMutation(() => ({
        mutationFn: () => lastValueFrom(this.ordersService.expireReservations()),
        onSuccess: (data) => {
            alert(`Reservas expiradas: ${data.expiredCount}`);
            this.ordersQuery.refetch();
        }
    }));

    expireReservations() {
        if (confirm('¿Estás seguro de expirar las reservas pendientes?')) {
            this.expireReservationsMutation.mutate();
        }
    }

    // Methods
    onSearch(query: string): void {
        this.filters.update((f) => ({ ...f, q: query, offset: 0 }));
    }

    onStatusChange(status: string): void {
        const newStatus = status === 'undefined' || !status ? undefined : (status as OrderStatus);
        this.filters.update((f) => ({
            ...f,
            status: newStatus,
            offset: 0,
        }));
    }

    onPageChange(page: number): void {
        // Basic pagination logic needed in template or here
        // For now assuming just offset handling
        const limit = this.filters().limit || 10;
        const offset = (page - 1) * limit;
        this.filters.update((f) => ({ ...f, offset }));
    }

    goToDetail(orderId: string): void {
        this.router.navigate(['/admin/orders', orderId]);
    }

    getOrdersList(data: any): Order[] {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        return data.data || [];
    }

    getBadgeClass(status: OrderStatus): string {
        switch (status) {
            case OrderStatus.PAID:
            case OrderStatus.DELIVERED:
                return 'badge-success';
            case OrderStatus.PENDING_PAYMENT:
            case OrderStatus.PREPARING:
            case OrderStatus.SHIPPED:
                return 'badge-info';
            case OrderStatus.CANCELED:
            case OrderStatus.RETURNED:
            case OrderStatus.REFUNDED:
                return 'badge-error';
            case OrderStatus.RETURN_REQUESTED:
                return 'badge-warning';
            default:
                return 'badge-default';
        }
    }

    getStatusLabel(status: OrderStatus): string {
        const labels: Record<OrderStatus, string> = {
            [OrderStatus.CREATED]: 'Creado',
            [OrderStatus.PENDING_PAYMENT]: 'Pendiente de Pago',
            [OrderStatus.PAID]: 'Pagado',
            [OrderStatus.PREPARING]: 'Preparando',
            [OrderStatus.SHIPPED]: 'Enviado',
            [OrderStatus.DELIVERED]: 'Entregado',
            [OrderStatus.CANCELED]: 'Cancelado',
            [OrderStatus.RETURN_REQUESTED]: 'Devolución Solicitada',
            [OrderStatus.RETURNED]: 'Devuelto',
            [OrderStatus.REFUNDED]: 'Reembolsado',
        };
        return labels[status] ?? status;
    }
}
