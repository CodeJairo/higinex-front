import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ArrowLeftRight, Boxes, LayoutDashboard, LucideAngularModule, Tag } from 'lucide-angular';

@Component({
    selector: 'admin-inventory-sidebar',
    imports: [RouterLink, RouterLinkActive, LucideAngularModule],
    templateUrl: './inventory-sidebar.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventorySidebar {
    readonly dashboardIcon = LayoutDashboard;
    readonly movementsIcon = ArrowLeftRight;
    readonly productsIcon = Tag;
    readonly boxesIcon = Boxes;
}
