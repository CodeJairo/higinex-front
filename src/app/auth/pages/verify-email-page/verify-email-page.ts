import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, CheckCircle, XCircle, ArrowRight } from 'lucide-angular';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-verify-email-page',
    standalone: true,
    imports: [CommonModule, RouterLink, LucideAngularModule],
    templateUrl: './verify-email-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPage implements OnInit {
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);

    readonly isLoading = signal(true);
    readonly isSuccess = signal(false);
    readonly isError = signal(false);

    // Icons
    readonly checkCircleIcon = CheckCircle;
    readonly xCircleIcon = XCircle;
    readonly arrowRightIcon = ArrowRight;

    ngOnInit(): void {
        const token = this.route.snapshot.queryParamMap.get('token');

        if (!token) {
            this.setResult(false);
            return;
        }

        this.verifyToken(token);
    }

    private async verifyToken(token: string) {
        try {
            const result = await this.authService.verifyEmail(token);
            this.setResult(result);
        } catch (error) {
            this.setResult(false);
        }
    }

    private setResult(success: boolean) {
        // Artificial delay for better UX if it happens too fast
        setTimeout(() => {
            this.isLoading.set(false);
            if (success) {
                this.isSuccess.set(true);
            } else {
                this.isError.set(true);
            }
        }, 1000);
    }
}
