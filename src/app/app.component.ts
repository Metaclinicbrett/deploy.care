import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LayoutComponent } from './components/layout/layout.component';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    LayoutComponent
  ],
  template: `
    @if (isPublicPage()) {
      <router-outlet />
    } @else {
      <app-layout />
    }
  `
})
export class AppComponent {
  private router = inject(Router);

  // Public pages that don't use the sidebar layout
  private publicPaths = [
    '/login',
    '/signup',
    '/employers',
    '/our-story',
    '/services',
    '/pricing',
    '/contact',
    '/demo',
    '/pending-approval',
    '/auth/callback',
    '/patient/assessment',
    '/'
  ];

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  isPublicPage = computed(() => {
    const url = this.currentUrl();
    // Check if current URL starts with any public path
    return this.publicPaths.some(path => {
      if (path === '/') return url === '/';
      return url.startsWith(path);
    });
  });
}
