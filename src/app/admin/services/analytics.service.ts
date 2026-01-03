
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

export interface DashboardKPIResponse {
    period: {
        from: string;
        to: string;
    };
    ordersCount: number;
    revenue: number;
    operational: {
        pending: number;
        preparing: number;
        shipped: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class AnalyticsService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

    getDashboardKPIs(): Observable<DashboardKPIResponse> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<DashboardKPIResponse>(this.buildUrl('/analytics/dashboard'), { headers })
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
