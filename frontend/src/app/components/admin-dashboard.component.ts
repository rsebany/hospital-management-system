import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto py-12 px-4">
      <h2 class="text-3xl font-bold text-primary-700 mb-8 text-center">Admin Dashboard</h2>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="card text-center">
          <h3 class="text-lg font-semibold text-secondary-900 mb-2">Total Users</h3>
          <p class="text-3xl font-bold text-primary-600">1,234</p>
        </div>
        <div class="card text-center">
          <h3 class="text-lg font-semibold text-secondary-900 mb-2">Appointments</h3>
          <p class="text-3xl font-bold text-primary-600">567</p>
        </div>
        <div class="card text-center">
          <h3 class="text-lg font-semibold text-secondary-900 mb-2">Doctors</h3>
          <p class="text-3xl font-bold text-primary-600">42</p>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {} 