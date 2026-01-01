import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../admin/interfaces/orders.interface';

@Pipe({
    name: 'orderStatusBadge',
    standalone: true,
})
export class OrderStatusBadgePipe implements PipeTransform {
    transform(status: OrderStatus | string | null | undefined): string {
        if (!status) return 'badge-ghost';

        switch (status) {
            case OrderStatus.CREATED:
            case OrderStatus.PENDING_PAYMENT:
            case OrderStatus.RETURN_REQUESTED:
                return 'badge-warning';

            case OrderStatus.PAID:
            case OrderStatus.PREPARING:
            case OrderStatus.SHIPPED:
                return 'badge-info';

            case OrderStatus.DELIVERED:
                return 'badge-success';

            case OrderStatus.CANCELED:
            case OrderStatus.RETURNED:
            case OrderStatus.REFUNDED:
                return 'badge-error';

            default:
                return 'badge-ghost';
        }
    }
}
