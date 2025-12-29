import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { LucideAngularModule, ArrowLeft, Building2, User, Phone, MapPin, FileText, Mail, Calendar } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { CustomersService } from '../../services/customers.service';

@Component({
    selector: 'app-customer-detail-page',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    templateUrl: './customer-detail-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailPage {
    private readonly route = inject(ActivatedRoute);
    private readonly customersService = inject(CustomersService);

    readonly customerId = this.route.snapshot.paramMap.get('id')!;

    // Icons
    readonly icons = {
        ArrowLeft, Building2, User, Phone, MapPin, FileText, Mail, Calendar
    };

    // Query
    readonly customerQuery = injectQuery(() => ({
        queryKey: ['customer', this.customerId],
        queryFn: () => firstValueFrom(this.customersService.getCustomer(this.customerId)),
    }));

    // Computed
    readonly customer = computed(() => this.customerQuery.data());
    readonly isLoading = computed(() => this.customerQuery.isPending());
}
