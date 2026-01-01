
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { Order, OrderStatus } from '../../../admin/interfaces/orders.interface';
import { CustomerOrdersService } from '../../services/customer-orders.service';
import { OrderStatusLabelPipe } from '../../../shared/pipes/order-status-label.pipe';
import { OrderStatusBadgePipe } from '../../../shared/pipes/order-status-badge.pipe';

@Component({
    selector: 'app-my-orders-page',
    standalone: true,
    imports: [CommonModule, RouterLink, OrderStatusLabelPipe, OrderStatusBadgePipe],
    templateUrl: './my-orders-page.html',
})
export class MyOrdersPageComponent {
    private readonly ordersService = inject(CustomerOrdersService);

    readonly ordersQuery = injectQuery(() => ({
        queryKey: ['customer-orders'],
        queryFn: async () => {
            const res = await lastValueFrom(this.ordersService.getOrders({ limit: 100 }));
            if (Array.isArray(res)) return res;
            return res.data;
        },
    }));

    activeTab: 'active' | 'history' = 'active';

    get activeOrders(): Order[] {
        const orders = this.ordersQuery.data() || [];
        const activeStatuses = [
            OrderStatus.CREATED,
            OrderStatus.PENDING_PAYMENT,
            OrderStatus.PAID,
            OrderStatus.PREPARING,
            OrderStatus.SHIPPED,
            OrderStatus.RETURN_REQUESTED,
        ];
        return orders.filter((o) => activeStatuses.includes(o.status));
    }

    get historyOrders(): Order[] {
        const orders = this.ordersQuery.data() || [];
        const historyStatuses = [
            OrderStatus.DELIVERED,
            OrderStatus.CANCELED,
            OrderStatus.RETURNED,
            OrderStatus.REFUNDED,
        ];
        return orders.filter((o) => historyStatuses.includes(o.status));
    }


}
