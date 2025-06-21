import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const router = inject(Router);
  
  const token = auth.getToken();
  let authReq = req;
  
  console.log('🔍 AuthInterceptor - URL:', req.url);
  console.log('🔑 AuthInterceptor - Token present:', !!token);
  console.log('🔑 AuthInterceptor - Token value:', token ? token.substring(0, 20) + '...' : 'null');
  
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ AuthInterceptor - Authorization header added');
  } else {
    console.log('⚠️ AuthInterceptor - No token found, request will be sent without auth');
  }
  
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('❌ AuthInterceptor - HTTP Error:', error.status, error.url);
      console.log('❌ AuthInterceptor - Error details:', error);
      
      if (error.status === 401) {
        console.log('🔐 AuthInterceptor - 401 Unauthorized, logging out user');
        auth.logoutLocal();
        router.navigate(['/auth/login']);
      }
      return throwError(() => error);
    })
  );
}; 