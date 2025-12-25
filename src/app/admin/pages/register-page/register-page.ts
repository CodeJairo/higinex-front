import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { DocumentType, RegisterPayload } from '../../../auth/interfaces';
import { AdminService } from '../../services/admin.service';

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PHONE_PATTERN = /^[0-9]{7,15}$/;
const DOCUMENT_NUMBER_PATTERN = /^[0-9A-Za-z-]+$/;

const customerCompletenessValidator = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as {
    email?: string;
    name?: string;
    phone?: string;
    documentType?: string;
    documentNumber?: string;
  } | null;

  if (!value) {
    return null;
  }

  const email = (value.email ?? '').trim();
  const name = (value.name ?? '').trim();
  const phone = (value.phone ?? '').trim();
  const documentNumber = (value.documentNumber ?? '').trim();
  const documentType = (value.documentType ?? '').trim();

  const hasOtherFields = !!(email || name || phone || documentNumber);
  if (!hasOtherFields) {
    return null;
  }

  const isComplete = !!(email && name && phone && documentNumber && documentType);
  return isComplete ? null : { customerIncomplete: true };
};

@Component({
  selector: 'auth-register-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly adminService = inject(AdminService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly showPassword = signal(false);
  readonly submitted = signal(false);
  readonly registerSuccess = signal(false);

  readonly isLoading = this.adminService.isRegisterLoading;
  readonly registerError = this.adminService.registerError;

  readonly documentTypes: Array<{ value: DocumentType; label: string }> = [
    { value: 'CC', label: 'CC - Cedula de Ciudadania' },
    { value: 'CE', label: 'CE - Cedula de Extranjeria' },
    { value: 'NIT', label: 'NIT - Numero de Identificacion Tributaria' },
    { value: 'TI', label: 'TI - Tarjeta de Identidad' },
    { value: 'PAS', label: 'PAS - Pasaporte' },
  ];

  readonly form = this.formBuilder.nonNullable.group({
    email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.formBuilder.nonNullable.control('', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(PASSWORD_PATTERN),
    ]),
    customer: this.formBuilder.nonNullable.group(
      {
        email: this.formBuilder.nonNullable.control('', [Validators.email]),
        name: this.formBuilder.nonNullable.control(''),
        phone: this.formBuilder.nonNullable.control('', [Validators.pattern(PHONE_PATTERN)]),
        documentType: this.formBuilder.nonNullable.control<DocumentType>('NIT'),
        documentNumber: this.formBuilder.nonNullable.control('', [
          Validators.pattern(DOCUMENT_NUMBER_PATTERN),
        ]),
      },
      { validators: [customerCompletenessValidator] }
    ),
  });

  togglePasswordVisibility(): void {
    this.showPassword.update((value) => !value);
  }

  async onSubmit(): Promise<void> {
    this.submitted.set(true);
    this.registerSuccess.set(false);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.buildPayload();
    const success = await this.adminService.register(payload);
    if (success) {
      this.registerSuccess.set(true);
      this.resetForm();
    }
  }

  goBack(): void {
    this.router.navigateByUrl('/sales/dashboard');
  }

  navigateToDashboard(): void {
    this.router.navigateByUrl('admin/dashboard');
  }

  dismissError(): void {
    this.adminService.clearRegisterError();
  }

  showError(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && (control.touched || this.submitted());
  }

  hasError(path: string, error: string): boolean {
    const control = this.form.get(path);
    return !!control && control.hasError(error);
  }

  customerIncomplete(): boolean {
    const group = this.customerGroup();
    return !!group?.errors?.['customerIncomplete'] && (group.touched || this.submitted());
  }

  private customerGroup(): FormGroup | null {
    return this.form.get('customer') as FormGroup | null;
  }

  private resetForm(): void {
    this.form.reset({
      email: '',
      password: '',
      customer: {
        email: '',
        name: '',
        phone: '',
        documentType: 'NIT',
        documentNumber: '',
      },
    });
    this.submitted.set(false);
  }

  private buildPayload(): RegisterPayload {
    const value = this.form.getRawValue();
    const payload: RegisterPayload = {
      email: value.email.trim(),
      password: value.password,
    };

    if (this.hasCustomerData(value.customer)) {
      payload.customer = {
        email: value.customer.email.trim(),
        name: value.customer.name.trim(),
        phone: value.customer.phone.trim(),
        documentType: value.customer.documentType as DocumentType,
        documentNumber: value.customer.documentNumber.trim(),
      };
    }

    return payload;
  }

  private hasCustomerData(customer: {
    email: string;
    name: string;
    phone: string;
    documentType: string;
    documentNumber: string;
  }): boolean {
    return !!(
      customer.email.trim() ||
      customer.name.trim() ||
      customer.phone.trim() ||
      customer.documentNumber.trim()
    );
  }
}
