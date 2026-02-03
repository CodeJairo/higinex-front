import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DemoBanner } from '../../../shared/components/demo-banner/demo-banner';
import { Footer } from '../../components/footer/footer';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'sales-layout-page',
  imports: [RouterOutlet, Footer, Navbar, DemoBanner],
  templateUrl: './sales-layout-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SalesLayoutPage {}
