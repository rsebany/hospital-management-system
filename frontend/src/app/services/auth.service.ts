import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

function decodeJwt(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/v1/auth';
  private tokenKey = 'auth_token';
  private refreshTokenKey = 'refresh_token';
  private loggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.checkInitialAuthState();
  }

  private checkInitialAuthState(): void {
    const token = this.getToken();
    if (token) {
      console.log('🔑 AuthService - Found existing token, setting logged in state');
      this.loggedIn$.next(true);
    } else {
      console.log('🔑 AuthService - No token found, setting logged out state');
      this.loggedIn$.next(false);
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const isLoggedIn = !!token;
    console.log('🔑 AuthService.isAuthenticated() - Token present:', !!token);
    return isLoggedIn;
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    console.log('🔑 AuthService.login() - Attempting login with:', credentials.email);
    
    return this.http.post(`${this.baseUrl}/login`, credentials).pipe(
      tap((res: any) => {
        console.log('🔑 AuthService.login() - Response received:', res);
        
        if (res && res.data && res.data.tokens && res.data.tokens.accessToken) {
          const token = res.data.tokens.accessToken;
          console.log('🔑 AuthService.login() - Storing token:', token.substring(0, 20) + '...');
          
          this.setToken(token);
          
          if (res.data.tokens.refreshToken) {
            this.setRefreshToken(res.data.tokens.refreshToken);
          }
          
          this.loggedIn$.next(true);
          console.log('🔑 AuthService.login() - Login successful, user logged in');
        } else {
          console.error('🔑 AuthService.login() - Invalid response format:', res);
        }
      })
    );
  }

  register(data: { firstName: string; lastName: string; email: string; password: string; role?: string; phoneNumber?: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(data: { token: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, data);
  }

  verifyEmail(token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-email`, { token });
  }

  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/me`);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/me`, profileData);
  }

  updateAddress(addressData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/me/address`, addressData);
  }

  changePassword(passwordData: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, passwordData);
  }

  enable2FA(): Observable<any> {
    return this.http.post(`${this.baseUrl}/enable-2fa`, {});
  }

  disable2FA(): Observable<any> {
    return this.http.post(`${this.baseUrl}/disable-2fa`, {});
  }

  setup2FA(): Observable<any> {
    return this.http.get(`${this.baseUrl}/setup-2fa`);
  }

  verify2FA(code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-2fa`, { code });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.removeToken();
        this.removeRefreshToken();
        this.loggedIn$.next(false);
      })
    );
  }

  setToken(token: string) {
    console.log('🔑 AuthService.setToken() - Setting token:', token.substring(0, 20) + '...');
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.tokenKey, token);
      console.log('🔑 AuthService.setToken() - Token stored in localStorage');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(this.tokenKey);
      console.log('🔑 AuthService.getToken() - Retrieved token:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    }
    return null;
  }

  removeToken() {
    console.log('🔑 AuthService.removeToken() - Removing token');
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      console.log('🔑 AuthService.removeToken() - Token removed from localStorage');
    }
  }

  setRefreshToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.refreshTokenKey, token);
    }
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.refreshTokenKey);
    }
    return null;
  }

  removeRefreshToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.refreshTokenKey);
    }
  }

  logoutLocal() {
    this.removeToken();
    this.removeRefreshToken();
    this.loggedIn$.next(false);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = decodeJwt(token);
    return payload?.role || null;
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.http.post(`${this.baseUrl}/refresh`, { refreshToken }).pipe(
      tap((res: any) => {
        if (res && res.token) {
          this.setToken(res.token);
        }
      })
    );
  }
} 