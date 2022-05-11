import { Injectable } from '@angular/core';
import {AuthenticateService} from "../service/authenticate.service";
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private authenticationService: AuthenticateService,
              private router: Router) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof  HttpResponse) {

      }
    }, (err: any) =>{
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          this.authenticationService.logout();
          this.router.navigate(['/login']);
        }else if ( err.status === 403) {
          this.router.navigate(['/'])
        }
      }
    }));
  }
}
