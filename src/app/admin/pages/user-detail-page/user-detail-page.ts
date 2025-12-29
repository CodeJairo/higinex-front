import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { LucideAngularModule, ArrowLeft, User, Shield, Key, Mail, Calendar, CheckCircle, XCircle, Building2, Phone, FileText } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';
import { UsersService } from '../../services/users.service';

@Component({
    selector: 'app-user-detail-page',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    templateUrl: './user-detail-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserDetailPage {
    private readonly route = inject(ActivatedRoute);
    private readonly usersService = inject(UsersService);
    private readonly router = inject(Router);

    readonly userId = this.route.snapshot.paramMap.get('id')!;

    // Icons
    readonly icons = {
        ArrowLeft, User, Shield, Key, Mail, Calendar, CheckCircle, XCircle,
        Building2, Phone, FileText
    };

    // Query
    readonly userQuery = injectQuery(() => ({
        queryKey: ['user', this.userId],
        queryFn: () => firstValueFrom(this.usersService.getUser(this.userId)),
    }));

    // Computed
    readonly user = computed(() => this.userQuery.data());
    readonly isLoading = computed(() => this.userQuery.isPending());

    // Methods
    async toggleStatus() {
        const u = this.user();
        if (!u) return;
        if (!confirm(`¿Estás seguro de ${u.isActive ? 'desactivar' : 'activar'} a este usuario?`)) return;

        try {
            await this.usersService.toggleUserStatus(u.id, !u.isActive);
        } catch (error) {
            alert('Error al actualizar estado');
        }
    }

    async deleteUser() {
        const u = this.user();
        if (!u) return;
        if (!confirm('ADVERTENCIA: ¿Seguro que deseas ELIMINAR este usuario?')) return;

        try {
            await this.usersService.deleteUser(u.id);
            this.router.navigate(['/admin/users']);
        } catch (error) {
            alert('Error al eliminar usuario');
        }
    }
}
