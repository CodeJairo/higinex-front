import { Pipe, PipeTransform } from '@angular/core';
import { OrderStatus } from '../../admin/interfaces/orders.interface';

@Pipe({
    name: 'orderStatusLabel',
    standalone: true,
})
export class OrderStatusLabelPipe implements PipeTransform {
    transform(status: OrderStatus | string | null | undefined): string {
        if (!status) return '';

        const labels: Record<string, string> = {
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

        return labels[status] || status;
    }
}
