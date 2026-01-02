import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InventorySidebar } from '../../components/inventory-sidebar/inventory-sidebar';

@Component({
  selector: 'app-inventory-layout-page',
  imports: [RouterOutlet, InventorySidebar],
  templateUrl: './inventory-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryLayoutPage { }
