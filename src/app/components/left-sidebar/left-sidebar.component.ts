import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface MenuItem {
  path: string;
  label: string;
  icon: string;
  active?: boolean;
  disabled?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-left-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './left-sidebar.component.html',
  styleUrl: './left-sidebar.component.scss'
})
export class LeftSidebarComponent implements OnInit {
  menuItems: MenuItem[] = [
    {
      path: '/',
      label: 'Home',
      icon: '🏠',
      active: false
    },
    {
      path: '/products',
      label: 'Products',
      icon: '📦',
      active: false
    },
    {
      path: '/users',
      label: 'Users',
      icon: '👥',
      active: false
    }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateActiveMenuItem();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateActiveMenuItem();
      });
  }

  private updateActiveMenuItem(): void {
    const currentPath = this.router.url;

    this.menuItems.forEach(item => {
      if (item.path === '/') {
        item.active = currentPath === '/';
      } else {
        item.active = currentPath.startsWith(item.path);
      }
    });
  }

  onMenuItemClick(item: MenuItem): void {
    if (item.disabled) {
      alert(`La funcionalidad "${item.label}" estará disponible próximamente.`);
      return;
    }

    console.log('Navigating to:', item.path);
  }
}
