import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen bg-primary-50">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center text-primary-700">Register</h2>
        <form>
          <div class="mb-4">
            <label class="block text-secondary-700 mb-2">Name</label>
            <input type="text" class="input-field" placeholder="Enter your name" required />
          </div>
          <div class="mb-4">
            <label class="block text-secondary-700 mb-2">Email</label>
            <input type="email" class="input-field" placeholder="Enter your email" required />
          </div>
          <div class="mb-6">
            <label class="block text-secondary-700 mb-2">Password</label>
            <input type="password" class="input-field" placeholder="Enter your password" required />
          </div>
          <button type="submit" class="btn-primary w-full">Register</button>
        </form>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {} 