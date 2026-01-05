import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UpdateCustomerProfilePayload } from '../../auth/interfaces';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
    providedIn: 'root',
})
export class CustomerProfileService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly queryClient = inject(QueryClient);
    private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');

    private buildUrl(path: string): string {
        const normalizedPath = path.startsWith('/') ? path : `/${path}`;
        return `${this.apiBaseUrl}${normalizedPath}`;
    }

    readonly updateProfileMutation = injectMutation(() => ({
        mutationFn: (payload: UpdateCustomerProfilePayload) => this.updateProfileRequest(payload),
        onSuccess: () => {
            // Invalidate 'auth/me' query to refresh user data in AuthService
            this.queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
        },
    }));

    async updateProfile(payload: UpdateCustomerProfilePayload): Promise<boolean> {
        try {
            await this.updateProfileMutation.mutateAsync(payload);
            return true;
        } catch (error) {
            return false;
        }
    }

    private async updateProfileRequest(payload: UpdateCustomerProfilePayload): Promise<void> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.patch<void>(this.buildUrl('/customers/me'), payload, { headers })
        );
    }
}
