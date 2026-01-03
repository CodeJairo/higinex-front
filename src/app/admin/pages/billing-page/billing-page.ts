
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { injectMutation, injectQuery } from '@tanstack/angular-query-experimental';
import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Banknote,
    Calendar,
    ChevronLeft,
    ChevronRight,
    CircleCheckBig,
    CircleQuestionMark,
    CreditCard,
    DollarSign,
    Download,
    FileText,
    Funnel,
    Landmark,
    Link,
    LucideAngularModule,
    Receipt,
    RefreshCcw,
    Search,
    TrendingUp,
    X
} from 'lucide-angular';
import { lastValueFrom } from 'rxjs';
import { FinanceService } from '../../services/finance.service';

@Component({
    selector: 'app-billing-page',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, FormsModule, RouterModule],
    templateUrl: './billing-page.html',
})
export class BillingPage {
    private financeService = inject(FinanceService);

    // Icons
    readonly receiptIcon = Receipt;
    readonly fileTextIcon = FileText;
    readonly dollarSignIcon = DollarSign;
    readonly trendingIcon = TrendingUp;
    readonly downloadIcon = Download;
    readonly filterIcon = Funnel;
    readonly calendarIcon = Calendar;
    readonly searchIcon = Search;
    readonly refreshIcon = RefreshCcw;
    readonly xIcon = X;
    readonly chevronRight = ChevronRight;
    readonly chevronLeft = ChevronLeft;
    readonly checkCircleIcon = CircleCheckBig;

    // Method Icons
    readonly cardIcon = CreditCard;
    readonly cashIcon = Banknote;
    readonly bankIcon = Landmark;
    readonly linkIcon = Link;
    readonly defaultIcon = CircleQuestionMark;

    // UI State
    showDateFilterModal = signal(false);

    // Filters State
    filters = signal<{
        from: Date;
        to: Date;
        tab: 'payments' | 'refunds';
        page: number;
        limit: number;
        periodType: 'month' | 'semester' | 'year' | 'custom';
        q?: string;
        status?: string;
        method?: string;
    }>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
        tab: 'payments',
        page: 1,
        limit: 10,
        periodType: 'month'
    });

    // Temp Filters for Modal
    tempFilters = signal({
        periodType: 'month' as 'month' | 'semester' | 'year' | 'custom',
        selectedYear: new Date().getFullYear(),
        selectedMonth: new Date().getMonth(),
        semester: 1,
        customFrom: format(new Date(), 'yyyy-MM-dd'),
        customTo: format(new Date(), 'yyyy-MM-dd')
    });

    // Constants
    readonly availableYears = [2024, 2025, 2026, 2027];
    readonly availableMonths = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Derived Filters for API
    apiParams = computed(() => {
        const f = this.filters();
        const offset = (f.page - 1) * f.limit;

        return {
            from: f.from.toISOString(),
            to: f.to.toISOString(),
            limit: f.limit,
            offset: offset,
            status: f.status || undefined,
            method: f.method || undefined
        };
    });

    // Queries
    summaryQuery = injectQuery(() => ({
        queryKey: ['finance-summary', this.apiParams().from, this.apiParams().to],
        queryFn: () => lastValueFrom(this.financeService.getSummary({
            from: this.apiParams().from,
            to: this.apiParams().to
        }))
    }));

    paymentsQuery = injectQuery(() => ({
        queryKey: ['finance-payments', this.apiParams()],
        queryFn: () => lastValueFrom(this.financeService.getPayments(this.apiParams())),
        enabled: this.filters().tab === 'payments'
    }));

    refundsQuery = injectQuery(() => ({
        queryKey: ['finance-refunds', this.apiParams()],
        queryFn: () => lastValueFrom(this.financeService.getRefunds(this.apiParams())),
        enabled: this.filters().tab === 'refunds'
    }));

    // Mutations
    generateReportMutation = injectMutation(() => ({
        mutationFn: (params: { type: 'payments' | 'refunds' | 'summary', format: 'csv' | 'pdf' }) =>
            this.financeService.generateReport({
                ...params,
                from: this.apiParams().from,
                to: this.apiParams().to
            }).forEach(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `reporte-${params.type}-${format(new Date(), 'yyyy-MM-dd')}.${params.format}`;
                a.click();
                window.URL.revokeObjectURL(url);
            })
    }));

    downloadInvoiceMutation = injectMutation(() => ({
        mutationFn: (orderId: string) =>
            this.financeService.downloadInvoice(orderId).forEach(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `factura-${orderId}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
            })
    }));

    // Modal Helpers
    updateTempFilter(changes: Partial<ReturnType<typeof this.tempFilters>>) {
        this.tempFilters.update(current => ({ ...current, ...changes }));
    }

    // Modal Actions
    openFilterModal() {
        const current = this.filters();
        // Initialize temp filters based on current selection if possible, or defaults
        this.tempFilters.set({
            periodType: current.periodType,
            selectedYear: current.from.getFullYear(),
            selectedMonth: current.from.getMonth(),
            semester: current.from.getMonth() < 6 ? 1 : 2,
            customFrom: format(current.from, 'yyyy-MM-dd'),
            customTo: format(current.to, 'yyyy-MM-dd')
        });
        this.showDateFilterModal.set(true);
    }

    applyFilter() {
        const t = this.tempFilters();
        let from: Date, to: Date;

        switch (t.periodType) {
            case 'month':
                const baseMonth = new Date(t.selectedYear, t.selectedMonth, 1);
                from = startOfMonth(baseMonth);
                to = endOfMonth(baseMonth);
                break;
            case 'semester':
                if (t.semester === 1) {
                    from = new Date(t.selectedYear, 0, 1); // Jan 1
                    to = endOfMonth(new Date(t.selectedYear, 5, 1)); // Jun 30
                } else {
                    from = new Date(t.selectedYear, 6, 1); // Jul 1
                    to = endOfMonth(new Date(t.selectedYear, 11, 1)); // Dec 31
                }
                break;
            case 'year':
                from = startOfYear(new Date(t.selectedYear, 0, 1));
                to = endOfYear(new Date(t.selectedYear, 0, 1));
                break;
            case 'custom':
                // Adjust for timezone offset to ensure exact date selection
                const fromParts = t.customFrom.split('-').map(Number);
                const toParts = t.customTo.split('-').map(Number);
                from = new Date(fromParts[0], fromParts[1] - 1, fromParts[2]);
                to = new Date(toParts[0], toParts[1] - 1, toParts[2], 23, 59, 59);
                break;
            default:
                from = startOfMonth(new Date());
                to = endOfMonth(new Date());
        }

        this.filters.update(f => ({
            ...f,
            from,
            to,
            periodType: t.periodType,
            page: 1
        }));
        this.showDateFilterModal.set(false);
    }

    // Direct Actions
    setTab(tab: 'payments' | 'refunds') {
        this.filters.update(f => ({ ...f, tab, page: 1 }));
    }

    setMonth(offset: number) {
        const newDate = new Date(this.filters().from);
        newDate.setMonth(newDate.getMonth() + offset);

        this.filters.update(f => ({
            ...f,
            from: startOfMonth(newDate),
            to: endOfMonth(newDate),
            periodType: 'month',
            page: 1
        }));
    }

    setCurrentMonth() {
        const now = new Date();
        this.filters.update(f => ({
            ...f,
            from: startOfMonth(now),
            to: endOfMonth(now),
            periodType: 'month',
            page: 1
        }));
    }

    onSearch(q: string) {
        this.filters.update(f => ({ ...f, q, page: 1 }));
    }

    onPageChange(page: number) {
        this.filters.update(f => ({ ...f, page }));
    }

    // Helpers
    // ... existing helpers ...
    getPaymentMethodIcon(method: string) {
        switch (method) {
            case 'CARD': return this.cardIcon;
            case 'CASH': return this.cashIcon;
            case 'TRANSFER': return this.bankIcon;
            case 'EXTERNAL_LINK': return this.linkIcon;
            default: return this.defaultIcon;
        }
    }

    getStatusClass(status: string) {
        switch (status) {
            case 'CONFIRMED': return 'badge-success';
            case 'COMPLETED': return 'badge-success';
            case 'PENDING': return 'badge-warning';
            case 'REJECTED': return 'badge-error';
            default: return 'badge-ghost';
        }
    }

    getStatusLabel(status: string) {
        switch (status) {
            case 'CONFIRMED': return 'Confirmado';
            case 'COMPLETED': return 'Completado';
            case 'PENDING': return 'Pendiente';
            case 'REJECTED': return 'Rechazado';
            default: return status;
        }
    }

    formatDateRange() {
        const f = this.filters();
        if (f.periodType === 'month') {
            return format(f.from, 'MMMM yyyy', { locale: es });
        } else if (f.periodType === 'year') {
            return format(f.from, 'yyyy');
        } else if (f.periodType === 'semester') {
            const sem = f.from.getMonth() < 6 ? '1º Semestre' : '2º Semestre';
            return `${sem} ${f.from.getFullYear()}`;
        }
        return `${format(f.from, 'dd MMM', { locale: es })} - ${format(f.to, 'dd MMM, yy', { locale: es })}`;
    }
}
