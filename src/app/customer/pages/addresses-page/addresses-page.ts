import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CustomerAddress {
  id: string;
  label?: string | null;
  line1: string;
  line2?: string | null;
  neighborhood?: string | null;
  city: string;
  state: string;
  postalCode?: string | null;
  notes?: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

@Component({
  selector: 'app-customer-addresses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addresses-page.html',
})
export class AddressesPage {
  // Estados de sistema (mock)
  isLoading = false;
  errorMessage: string | null = null;

  // Data mock (simula respuesta del backend)
  addresses: CustomerAddress[] = [
    {
      id: 'address-1',
      label: 'Casa',
      line1: 'Calle 123 #45-67',
      line2: 'Apto 302',
      neighborhood: 'Laureles',
      city: 'Medellín',
      state: 'Antioquia',
      postalCode: '050021',
      notes: 'Entregar en portería',
      isDefault: true,
      createdAt: '2025-01-01T12:00:00.000Z',
      updatedAt: '2025-01-05T12:00:00.000Z',
    },
    {
      id: 'address-2',
      label: 'Oficina',
      line1: 'Cra 45 #12-34',
      line2: 'Piso 5, Oficina 502',
      neighborhood: 'El Poblado',
      city: 'Medellín',
      state: 'Antioquia',
      postalCode: '050022',
      notes: 'Recepción 24 horas',
      isDefault: false,
      createdAt: '2025-01-02T10:00:00.000Z',
      updatedAt: '2025-01-03T10:00:00.000Z',
    },
  ];

  get hasDefault(): boolean {
    return this.addresses.some((a) => a.isDefault);
  }

  // Estado UI formularios / modales
  isFormOpen = false;
  isDeleteConfirmOpen = false;

  editingAddress: CustomerAddress | null = null;
  addressToDelete: CustomerAddress | null = null;

  // Modelo simple para el formulario (mock)
  addressForm = {
    label: '',
    line1: '',
    line2: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    notes: '',
    isDefault: false,
  };

  // --- Acciones UI (mock, sin HTTP) ---

  openCreateForm() {
    this.editingAddress = null;
    this.addressForm = {
      label: '',
      line1: '',
      line2: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      notes: '',
      // Si no hay default aún, sugerimos marcar esta como default
      isDefault: !this.hasDefault,
    };
    this.isFormOpen = true;
  }

  openEditForm(address: CustomerAddress) {
    this.editingAddress = address;
    this.addressForm = {
      label: address.label ?? '',
      line1: address.line1,
      line2: address.line2 ?? '',
      neighborhood: address.neighborhood ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode ?? '',
      notes: address.notes ?? '',
      isDefault: address.isDefault,
    };
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  saveAddress() {
    // Aquí luego conectas con POST/PATCH.
    console.log('Guardar dirección (mock)', {
      form: this.addressForm,
      editing: this.editingAddress,
    });
    this.isFormOpen = false;
  }

  confirmDelete(address: CustomerAddress) {
    this.addressToDelete = address;
    this.isDeleteConfirmOpen = true;
  }

  cancelDelete() {
    this.isDeleteConfirmOpen = false;
    this.addressToDelete = null;
  }

  deleteAddress() {
    if (this.addressToDelete) {
      this.addresses = this.addresses.filter((a) => a.id !== this.addressToDelete!.id);
    }
    this.cancelDelete();
  }

  makeDefault(address: CustomerAddress) {
    // Mock de PATCH /default
    this.addresses = this.addresses.map((a) => ({
      ...a,
      isDefault: a.id === address.id,
    }));
  }

  retry() {
    // Aquí luego harás el refetch.
    console.log('Reintentar (mock)');
  }
}
