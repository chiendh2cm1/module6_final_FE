import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {Observable,BehaviorSubject} from "rxjs";
import {UserToken} from "../model/user-token";
import {map} from "rxjs/operators";

const API_URL = `${environment.api_url}`;
@Injectable({
  providedIn: 'root'
})
export class AuthenticateService {
  public currentUserSubject: BehaviorSubject<UserToken>;
  public currentUser: Observable<UserToken>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<UserToken>(JSON.parse(<string>localStorage.getItem('user')));
    this.currentUser = this.currentUserSubject.asObservable();
  }


  login(username: string, password: string):Observable<any> {
    return this.http.post<any>(API_URL + 'login', {username, password})
      .pipe(map(user => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }))
  }

  logout() {
    localStorage.removeItem('user');
    // @ts-ignore
    this.currentUserSubject.next(null);
  }

  getCurrentUserValue() {
    return this.currentUserSubject.value;
  }
}
