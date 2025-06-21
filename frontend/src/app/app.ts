import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NavigationComponent } from './components/navigation.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  isLoggedIn: Observable<boolean>;
  showNavigation = true;

  constructor(private auth: AuthService, private router: Router) {
    this.isLoggedIn = this.auth.isLoggedIn();
    
    // Hide navigation on auth pages
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      console.log('Current URL:', currentUrl);
      this.showNavigation = !currentUrl.includes('/auth/');
    });
  }
}
