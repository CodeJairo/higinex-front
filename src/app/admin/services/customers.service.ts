import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { Customer, CustomerFilters } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class CustomersService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

    getCustomers(filters: CustomerFilters = {}): Observable<Customer[]> {
        let params = new HttpParams({
            fromObject: {
                limit: String(filters.limit || 20),
                offset: String(filters.offset || 0),
            },
        });

        if (filters.q) params = params.set('q', filters.q);

        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<Customer[]>(this.buildUrl('/customers'), { headers, params })
            )
        );
    }

    getCustomer(id: string): Observable<Customer> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<Customer>(this.buildUrl(`/customers/${id}`), { headers })
            )
        );
    }

    private buildUrl(path: string): string {
        if (!this.apiBaseUrl) {
            return path;
        }
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.apiBaseUrl}${normalizedPath}`;
    }
}
