import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';
import { defer, firstValueFrom, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { User, UserFilters } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class UsersService {
    private readonly http = inject(HttpClient);
    private readonly authService = inject(AuthService);
    private readonly apiBaseUrl = environment.apiUrl.replace(/\/$/, '');
    private readonly queryClient = injectQueryClient();

    // Queries
    getUsers(filters: UserFilters = {}): Observable<User[]> {
        let params = new HttpParams({
            fromObject: {
                limit: String(filters.limit || 20),
                offset: String(filters.offset || 0),
            },
        });

        if (filters.q) params = params.set('q', filters.q);
        if (filters.role) params = params.set('role', filters.role);

        // Handle boolean filters that need to be sent as string "true"|"false"
        if (filters.isActive !== undefined) {
            params = params.set('isActive', String(filters.isActive));
        }
        if (filters.hasCustomer !== undefined) {
            params = params.set('hasCustomer', String(filters.hasCustomer));
        }

        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<User[]>(this.buildUrl('/users'), { headers, params })
            )
        );
    }

    getUser(id: string): Observable<User> {
        return defer(() =>
            this.authService.requestWithAuthHeaders((headers) =>
                this.http.get<User>(this.buildUrl(`/users/${id}`), { headers })
            )
        );
    }

    // Mutations
    private readonly updateStatusMutation = injectMutation(() => ({
        mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
            this.updateStatusRequest(id, isActive),
        onSuccess: (_, variables) => {
            this.queryClient.invalidateQueries({ queryKey: ['users'] });
            this.queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
        },
    }));

    private readonly deleteUserMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.deleteUserRequest(id),
        onSuccess: (_, id) => {
            this.queryClient.invalidateQueries({ queryKey: ['users'] });
            this.queryClient.invalidateQueries({ queryKey: ['user', id] });
        },
    }));

    // Public Mutation Methods
    async toggleUserStatus(id: string, isActive: boolean): Promise<void> {
        await this.updateStatusMutation.mutateAsync({ id, isActive });
    }

    async deleteUser(id: string): Promise<void> {
        await this.deleteUserMutation.mutateAsync(id);
    }

    // Helpers
    private async updateStatusRequest(id: string, isActive: boolean): Promise<unknown> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.patch(
                this.buildUrl(`/users/${id}/status`),
                { isActive },
                { headers }
            )
        );
    }

    private async deleteUserRequest(id: string): Promise<unknown> {
        return this.authService.requestWithAuthHeaders((headers) =>
            this.http.delete(this.buildUrl(`/users/${id}`), { headers })
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
