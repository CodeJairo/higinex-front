import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { OrderNoteVisibility, OrderStatus, PaymentMethod } from '../../interfaces/orders.interface';
import { OrdersService } from '../../services/orders.service';

@Component({
    selector: 'app-order-detail-page',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule],
    templateUrl: './order-detail-page.html',
})
export class OrderDetailPage {
    private readonly route = inject(ActivatedRoute);
    private readonly ordersService = inject(OrdersService);

    orderId = this.route.snapshot.paramMap.get('id')!;

    // Queries
    orderQuery = injectQuery(() => ({
        queryKey: ['order', this.orderId],
        queryFn: () => lastValueFrom(this.ordersService.getOrder(this.orderId)),
    }));

    shipmentsQuery = injectQuery(() => ({
        queryKey: ['order-shipments', this.orderId],
        queryFn: () => lastValueFrom(this.ordersService.getShipments(this.orderId)),
        enabled: this.selectedTab() === 'shipments',
    }));

    paymentsQuery = injectQuery(() => ({
        queryKey: ['order-payments', this.orderId],
        queryFn: () => lastValueFrom(this.ordersService.getPayments(this.orderId)),
        enabled: this.selectedTab() === 'payments',
    }));

    returnsQuery = injectQuery(() => ({
        queryKey: ['order-returns', this.orderId],
        queryFn: () => lastValueFrom(this.ordersService.getReturns(this.orderId)),
        enabled: this.selectedTab() === 'returns',
    }));

    refundsQuery = injectQuery(() => ({
        queryKey: ['order-refunds', this.orderId],
        queryFn: () => lastValueFrom(this.ordersService.getRefunds(this.orderId)),
        enabled: this.selectedTab() === 'refunds',
    }));

    notesQuery = injectQuery(() => ({
        queryKey: ['order-notes', this.orderId],
        queryFn: () => lastValueFrom(this.ordersService.getNotes(this.orderId)),
        enabled: this.selectedTab() === 'notes',
    }));


    // UI State
    selectedTab = signal<'overview' | 'shipments' | 'payments' | 'returns' | 'refunds' | 'notes'>('overview');

    // Note Form
    noteMessage = signal('');
    noteVisibility = signal<OrderNoteVisibility>(OrderNoteVisibility.INTERNAL);

    // Constants
    OrderStatus = OrderStatus;
    OrderNoteVisibility = OrderNoteVisibility;

    // Mutations
    createNoteMutation = this.ordersService.createNoteMutation;
    updateStatusMutation = this.ordersService.updateStatusMutation;

    confirmPaymentMutation = injectMutation(() => ({
        mutationFn: (payload: any) => lastValueFrom(this.ordersService.confirmPayment(this.orderId, payload)),
        onSuccess: () => {
            this.orderQuery.refetch();
            this.setTab('payments');
        }
    }));

    cancelOrderMutation = injectMutation(() => ({
        mutationFn: (payload: any) => lastValueFrom(this.ordersService.cancelOrder(this.orderId, payload)),
        onSuccess: () => this.orderQuery.refetch()
    }));

    // Form Signals
    paymentMethod = signal<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
    paymentReference = signal('');
    cancelReason = signal('');

    // Tab Navigation
    setTab(tab: 'overview' | 'shipments' | 'payments' | 'returns' | 'refunds' | 'notes'): void {
        this.selectedTab.set(tab);
    }

    // Actions
    addNote() {
        if (!this.noteMessage().trim()) return;
        this.createNoteMutation.mutate({
            orderId: this.orderId,
            payload: {
                message: this.noteMessage(),
                visibility: this.noteVisibility()
            }
        });
        this.noteMessage.set('');
    }

    updateOrderStatus(status: OrderStatus) {
        if (confirm(`¿Estás seguro de cambiar el estado a ${status}?`)) {
            this.updateStatusMutation.mutate({
                orderId: this.orderId,
                payload: { status }
            });
        }
    }

    openConfirmPaymentModal() {
        (document.getElementById('confirm_payment_modal') as any).showModal();
    }

    confirmPayment() {
        this.confirmPaymentMutation.mutate({
            method: this.paymentMethod(),
            reference: this.paymentReference()
        });
        (document.getElementById('confirm_payment_modal') as any).close();
    }

    openCancelOrderModal() {
        (document.getElementById('cancel_order_modal') as any).showModal();
    }

    cancelOrder() {
        this.cancelOrderMutation.mutate({
            comment: this.cancelReason()
        });
        (document.getElementById('cancel_order_modal') as any).close();
    }

    goToShipments() {
        this.setTab('shipments');
    }

    // Helpers
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
}
