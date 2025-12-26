import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'admin-footer',
  imports: [],
  templateUrl: './admin-footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFooter {
  actualYear(): number {
    return new Date().getFullYear();
  }
}
