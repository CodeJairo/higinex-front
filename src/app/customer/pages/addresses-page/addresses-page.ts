import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AlertCircle,
  Check,
  Edit3,
  Home,
  LucideAngularModule,
  MapPin,
  Plus,
  Trash2,
} from 'lucide-angular';
import { injectQuery } from '@tanstack/angular-query-experimental';
import {
  CreateCustomerAddressPayload,
  CustomerAddress,
  UpdateCustomerAddressPayload,
} from '../../interfaces/customer-address.interface';
import { CustomerAddressService } from '../../services/customer-address.service';

@Component({
  selector: 'app-customer-addresses',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './addresses-page.html',
})
export class AddressesPage {
  private readonly addressService = inject(CustomerAddressService);

  readonly mapPinIcon = MapPin;
  readonly plusIcon = Plus;
  readonly editIcon = Edit3;
  readonly trashIcon = Trash2;
  readonly checkIcon = Check;
  readonly alertCircleIcon = AlertCircle;
  readonly homeIcon = Home;

  // Consultar direcciones
  private readonly addressesQuery = injectQuery(() => ({
    queryKey: ['customer-addresses'],
    queryFn: () => this.addressService.listAddresses(),
  }));

  // Estados computados desde la query
  readonly addresses = computed(() => this.addressesQuery.data() ?? []);
  readonly isLoading = computed(() => this.addressesQuery.isLoading());
  readonly errorMessage = computed(() =>
    this.addressesQuery.isError() ? 'Error al cargar las direcciones.' : null
  );

  // Helper para saber si hay default
  readonly hasDefault = computed(() => this.addresses().some((a) => a.isDefault));

  // Loading states de acciones (desde el servicio)
  readonly isSaving = computed(
    () => this.addressService.isCreating() || this.addressService.isUpdating()
  );

  // Estado UI formularios / modales
  isFormOpen = false;
  isDeleteConfirmOpen = false;

  editingAddress: CustomerAddress | null = null;
  addressToDelete: CustomerAddress | null = null;

  // Modelo para el formulario
  addressForm: CreateCustomerAddressPayload = {
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
      isDefault: !this.hasDefault(),
    };
    this.addressService.clearErrors();
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
    this.addressService.clearErrors();
    this.isFormOpen = true;
  }

  closeForm() {
    this.isFormOpen = false;
  }

  async saveAddress() {
    // Validar campos mínimos si se desea, aunque el backend valida
    if (!this.addressForm.line1 || !this.addressForm.city || !this.addressForm.state) {
      // Podríamos mostrar un toast o error local
      return;
    }

    let success = false;
    if (this.editingAddress) {
      // Update
      const payload: UpdateCustomerAddressPayload = { ...this.addressForm };
      // Limpiar campos vacíos si es necesario, o enviarlos tal cual
      success = await this.addressService.updateAddress(this.editingAddress.id, payload);
    } else {
      // Create
      success = await this.addressService.createAddress(this.addressForm);
    }

    if (success) {
      this.closeForm();
    }
  }

  confirmDelete(address: CustomerAddress) {
    this.addressToDelete = address;
    this.isDeleteConfirmOpen = true;
  }

  cancelDelete() {
    this.isDeleteConfirmOpen = false;
    this.addressToDelete = null;
  }

  async deleteAddress() {
    if (this.addressToDelete) {
      const success = await this.addressService.deleteAddress(this.addressToDelete.id);
      if (success) {
        this.cancelDelete();
      }
    }
  }

  async makeDefault(address: CustomerAddress) {
    // Optimistic update podría ser manejado por react-query (invalidate), 
    // pero aquí esperamos la respuesta
    await this.addressService.setDefaultAddress(address.id);
  }

  retry() {
    this.addressesQuery.refetch();
  }
}
