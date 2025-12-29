import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { LucideAngularModule, Search, Filter, Shield, ShieldCheck, User as UserIcon, MoreVertical, Trash2, CheckCircle, XCircle } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../services/users.service';
import { User } from '../../interfaces';

@Component({
    selector: 'app-users-list-page',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, LucideAngularModule],
    templateUrl: './users-list-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersListPage {
    private readonly usersService = inject(UsersService);
    private readonly router = inject(Router);

    // Icons
    readonly icons = {
        Search, Filter, Shield, ShieldCheck, User: UserIcon, MoreVertical, Trash2, CheckCircle, XCircle
    };

    // Filters
    readonly filterQ = signal<string>('');
    readonly filterRole = signal<'ADMIN' | 'USER' | ''>('');
    readonly filterIsActive = signal<string>(''); // "true" | "false" | ""

    // Pagination
    readonly limit = signal(20);
    readonly offset = signal(0);

    // Query
    readonly usersQuery = injectQuery(() => ({
        queryKey: ['users', this.limit(), this.offset(), this.filterQ(), this.filterRole(), this.filterIsActive()],
        queryFn: () => firstValueFrom(this.usersService.getUsers({
            limit: this.limit(),
            offset: this.offset(),
            q: this.filterQ() || undefined,
            role: this.filterRole() as 'ADMIN' | 'USER' || undefined,
            isActive: this.filterIsActive() || undefined, // Service helper handles string conversion if needed, but here we pass string logic to service? logic in service handles conversion
        })),
    }));

    // Computed
    readonly users = computed(() => this.usersQuery.data() || []);
    readonly isLoading = computed(() => this.usersQuery.isPending());

    // Methods
    clearFilters() {
        this.filterQ.set('');
        this.filterRole.set('');
        this.filterIsActive.set('');
        this.offset.set(0);
    }

    async toggleStatus(user: User) {
        if (!confirm(`¿Estás seguro de ${user.isActive ? 'desactivar' : 'activar'} a este usuario?`)) return;
        try {
            await this.usersService.toggleUserStatus(user.id, !user.isActive);
        } catch (error) {
            console.error('Error toggling status', error);
            alert('Error al cambiar el estado del usuario');
        }
    }

    async deleteUser(user: User) {
        if (!confirm(`¿Estás seguro de ELIMINAR a ${user.email}? Esta acción no se puede deshacer inmediatamente.`)) return;
        try {
            await this.usersService.deleteUser(user.id);
        } catch (error) {
            console.error('Error deleting user', error);
            alert('Error al eliminar usuario');
        }
    }

    nextPage() {
        if (this.users().length === this.limit()) {
            this.offset.update(v => v + this.limit());
        }
    }

    prevPage() {
        if (this.offset() > 0) {
            this.offset.update(v => Math.max(0, v - this.limit()));
        }
    }
}
