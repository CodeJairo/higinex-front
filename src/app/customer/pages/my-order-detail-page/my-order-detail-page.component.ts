
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { AlertCircle, ArrowLeft, Calendar, ChevronLeft, CircleX, CreditCard, Download, LucideAngularModule, MapPin, Package, Phone, Printer, Receipt, ShoppingBag, Tag } from 'lucide-angular';
import { lastValueFrom } from 'rxjs';
import { OrderStatus } from '../../../admin/interfaces/orders.interface';
import { CustomerOrdersService } from '../../services/customer-orders.service';
import { OrderStatusLabelPipe } from '../../../shared/pipes/order-status-label.pipe';
import { OrderStatusBadgePipe } from '../../../shared/pipes/order-status-badge.pipe';

@Component({
    selector: 'app-my-order-detail-page',
    imports: [CommonModule, RouterLink, OrderStatusLabelPipe, OrderStatusBadgePipe, LucideAngularModule],
    templateUrl: './my-order-detail-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyOrderDetailPageComponent {
    private readonly route = inject(ActivatedRoute);
    private readonly ordersService = inject(CustomerOrdersService);

    readonly chevronLeftIcon = ChevronLeft;
    readonly arrowLeftIcon = ArrowLeft;
    readonly circleXIcon = CircleX;
    readonly calendarIcon = Calendar;
    readonly shoppingBagIcon = ShoppingBag;
    readonly mapPinIcon = MapPin;
    readonly phoneIcon = Phone;
    readonly receiptIcon = Receipt;
    readonly printerIcon = Printer;
    readonly downloadIcon = Download;
    readonly alertCircleIcon = AlertCircle;
    readonly packageIcon = Package;
    readonly creditCardIcon = CreditCard;
    readonly tagIcon = Tag;

    readonly orderId = this.route.snapshot.paramMap.get('id')!;

    readonly orderQuery = injectQuery(() => ({
        queryKey: ['customer-order', this.orderId],
        queryFn: async () => {
            return lastValueFrom(this.ordersService.getOrder(this.orderId));
        },
    }));


}
