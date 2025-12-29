import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { LucideAngularModule, Search, Building2, User, Phone, FileText, ArrowRight, MoreVertical } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { CustomersService } from '../../services/customers.service';

@Component({
    selector: 'app-customers-list-page',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
    templateUrl: './customers-list-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersListPage {
    private readonly customersService = inject(CustomersService);

    // Icons
    readonly icons = {
        Search, Building2, User, Phone, FileText, ArrowRight, MoreVertical
    };

    // Filters
    readonly filterQ = signal<string>('');

    // Pagination
    readonly limit = signal(20);
    readonly offset = signal(0);

    // Query
    readonly customersQuery = injectQuery(() => ({
        queryKey: ['customers', this.limit(), this.offset(), this.filterQ()],
        queryFn: () => firstValueFrom(this.customersService.getCustomers({
            limit: this.limit(),
            offset: this.offset(),
            q: this.filterQ() || undefined,
        })),
    }));

    // Computed
    readonly customers = computed(() => this.customersQuery.data() || []);
    readonly isLoading = computed(() => this.customersQuery.isPending());

    // Methods
    clearFilters() {
        this.filterQ.set('');
        this.offset.set(0);
    }

    nextPage() {
        if (this.customers().length === this.limit()) {
            this.offset.update(v => v + this.limit());
        }
    }

    prevPage() {
        if (this.offset() > 0) {
            this.offset.update(v => Math.max(0, v - this.limit()));
        }
    }
}
