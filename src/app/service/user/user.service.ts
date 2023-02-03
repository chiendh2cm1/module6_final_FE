import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {User} from "../../model/user";
import {MemberWorkspace} from "../../model/member-workspace";

const API_URL = `${environment.api_url}`

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  getAllUser(): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}users`);
  }

  register(user: User): Observable<User> {
    return this.http.post(`${API_URL}users`, user);
  }

  getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${API_URL}users/${id}`);
  }

  getUserByUserNameAndEmail(username: string, email: string): Observable<User> {
    return this.http.post<User>(API_URL + 'users/recoverpassword', {username, email})
  }

  updateById(id: number, user: User): Observable<any> {
    return this.http.put<any>(`${API_URL}users/${id}`, user);
  }

  updateByIdRecover(id: number, user: User): Observable<any> {
    return this.http.put<any>(`${API_URL}users/${id}/recover`, user);
  }

  findUsersByKeyword(keyword: string): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}users/search/${keyword}`);
  }

  getMemberByBoardId(boardId: any): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}users/board/${boardId}`);
  }

  findByKeywordAndWorkspace(string: string, workspaceId: any): Observable<User[]> {
    return this.http.get<User[]>(`${API_URL}users/search/${string}/${workspaceId}`);
  }

  changePassword(id: number, formData: any): Observable<User> {
    return this.http.post<User>(`${API_URL}users/set-password/${id}`, formData);
  }
}
