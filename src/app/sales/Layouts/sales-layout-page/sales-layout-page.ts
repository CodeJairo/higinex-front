import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'sales-layout-page',
  imports: [RouterOutlet, Footer],
  templateUrl: './sales-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesLayoutPage {}
