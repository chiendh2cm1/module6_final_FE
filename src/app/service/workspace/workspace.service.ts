import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs";
import {Workspace} from "../../model/workspace";
import {A} from "@angular/cdk/keycodes";

const API_URL = `${environment.api_url}`

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {

  constructor(private httpClient: HttpClient) {
  }

  findAll():Observable<Workspace[]> {
    return this.httpClient.get<Workspace[]>(`${API_URL}workspaces`)
  }

  findAllByOwnerId(id: any):Observable<Workspace[]> {
    return this.httpClient.get<Workspace[]>(`${API_URL}workspaces/owner/${id}`)
  }

  findById(id:any):Observable<Workspace>{
    return this.httpClient.get<Workspace>(`${API_URL}workspaces/${id}`)
  }

  updateWorkspace(id: any, workspace: Workspace): Observable<Workspace>{
    return this.httpClient.put<Workspace>(`${API_URL}workspaces/${id}`, workspace)
  }

  createWorkspace(workspace:Workspace):Observable<Workspace>{
    return this.httpClient.post<Workspace>(`${API_URL}workspaces`,workspace)
  }

  deleteWorkspace(id: any): Observable<Workspace>{
    return this.httpClient.delete<Workspace>(`${API_URL}workspaces/${id}`)
  }

  getCurrentWorkspaceID(id:any): Observable<number>{
    return this.httpClient.get<number>(`${API_URL}workspaces/${id}/boards`);
  }
}
