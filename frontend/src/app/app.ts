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

  constructor(private auth: AuthService, private router: Router) {
    this.isLoggedIn = this.auth.isLoggedIn();
  }

  get isAdmin(): boolean {
    return this.auth.getUserRole() === 'admin';
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
