import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AlertCircle, ArrowLeft, Calendar, ChevronRight, CircleX, Clock, CreditCard, Download, LucideAngularModule, MapPin, Package, Printer, ShoppingBag, Tag } from 'lucide-angular';
import { lastValueFrom } from 'rxjs';
import { Order, OrderStatus } from '../../../admin/interfaces/orders.interface';
import { CustomerOrdersService } from '../../services/customer-orders.service';
import { OrderStatusLabelPipe } from '../../../shared/pipes/order-status-label.pipe';
import { OrderStatusBadgePipe } from '../../../shared/pipes/order-status-badge.pipe';

@Component({
    selector: 'app-my-orders-page',
    imports: [CommonModule, RouterLink, OrderStatusLabelPipe, OrderStatusBadgePipe, LucideAngularModule],
    templateUrl: './my-orders-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrdersPageComponent {
    private readonly ordersService = inject(CustomerOrdersService);

    readonly circleXIcon = CircleX;
    readonly shoppingBagIcon = ShoppingBag;
    readonly calendarIcon = Calendar;
    readonly clockIcon = Clock;
    readonly chevronRightIcon = ChevronRight;
    readonly arrowLeftIcon = ArrowLeft;
    readonly packageIcon = Package;
    readonly mapPinIcon = MapPin;
    readonly alertCircleIcon = AlertCircle;
    readonly creditCardIcon = CreditCard;
    readonly tagIcon = Tag;
    readonly printerIcon = Printer;
    readonly downloadIcon = Download;

    readonly ordersQuery = injectQuery(() => ({
        queryKey: ['customer-orders'],
        queryFn: async () => {
            const res = await lastValueFrom(this.ordersService.getOrders({ limit: 100 }));
            if (Array.isArray(res)) return res;
            return res.data;
        },
    }));

    activeTab = signal<'active' | 'history'>('active');

    activeOrders = computed(() => {
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
    });

    historyOrders = computed(() => {
        const orders = this.ordersQuery.data() || [];
        const historyStatuses = [
            OrderStatus.DELIVERED,
            OrderStatus.CANCELED,
            OrderStatus.RETURNED,
            OrderStatus.REFUNDED,
        ];
        return orders.filter((o) => historyStatuses.includes(o.status));
    });


}
