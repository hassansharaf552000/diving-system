import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ToastService } from '../../shared/services/toast.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred.';

        if (error.error instanceof ErrorEvent) {
          // Client-side or network error
          errorMessage = error.error.message;
        } else {
          // Backend error
          if (error.status === 401) {
            errorMessage = 'Session expired or unauthorized. Please log in again.';
            this.toast.warning(errorMessage, 5000);
            this.router.navigate(['/auth/login']);
            return throwError(() => error); // Forward original error
          } else if (error.status === 403) {
            errorMessage = 'Access Denied: You do not have permissions to perform this action.';
          } else if (error.status === 404) {
            errorMessage = 'Resource not found.';
          } else if (error.error?.message) {
             // Use backend's error message if provided
            errorMessage = error.error.message;
          } else {
             // Fallback for 500 or others
            errorMessage = `Server Error (${error.status})`;
          }
        }

        // Display the error using the global Toast layout instead of native browser alerts
        this.toast.error(errorMessage, 5000);

        // We throw a slightly modified error so that if a component catches it
        // and falls back to err.message in an alert, it shows a clean message 
        // instead of "Http failure response for X: 403 Forbidden"
        const cleanError = new Error(errorMessage);
        (cleanError as any).error = error.error;
        (cleanError as any).status = error.status;
        
        return throwError(() => cleanError);
      })
    );
  }
}
