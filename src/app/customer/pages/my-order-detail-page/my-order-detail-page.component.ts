
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { OrderStatus } from '../../../admin/interfaces/orders.interface';
import { CustomerOrdersService } from '../../services/customer-orders.service';
import { OrderStatusLabelPipe } from '../../../shared/pipes/order-status-label.pipe';
import { OrderStatusBadgePipe } from '../../../shared/pipes/order-status-badge.pipe';

@Component({
    selector: 'app-my-order-detail-page',
    standalone: true,
    imports: [CommonModule, RouterLink, OrderStatusLabelPipe, OrderStatusBadgePipe],
    templateUrl: './my-order-detail-page.html',
})
export class MyOrderDetailPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly ordersService = inject(CustomerOrdersService);

    readonly orderId = this.route.snapshot.paramMap.get('id')!;

    readonly orderQuery = injectQuery(() => ({
        queryKey: ['customer-order', this.orderId],
        queryFn: async () => {
            return lastValueFrom(this.ordersService.getOrder(this.orderId));
        },
    }));


}
