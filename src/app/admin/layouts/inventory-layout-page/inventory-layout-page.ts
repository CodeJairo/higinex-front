import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-inventory-layout-page',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './inventory-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryLayoutPage {}
