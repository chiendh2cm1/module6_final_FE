import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {MemberWorkspace} from "../../model/member-workspace";

const API_URL = `${environment.api_url}`

@Injectable({
  providedIn: 'root'
})
export class MemberWorkspaceService {

  constructor(private httpClient: HttpClient) {
  }

  findMemberById(id: any): Observable<MemberWorkspace> {
    return this.httpClient.get<MemberWorkspace>(`${API_URL}member-workspace/${id}`)
  }

  updateWorkspaceMember(id:any, member:MemberWorkspace):Observable<MemberWorkspace>{
    return this.httpClient.put<MemberWorkspace>(`${API_URL}member-workspace/${id}`,member)
  }
  addWorkspaceMember(member: MemberWorkspace):Observable<MemberWorkspace>{
    return this.httpClient.post<MemberWorkspace>(`${API_URL}member-workspace/`,member);
  }

  deleteWorkspaceMembers(members: MemberWorkspace[]):Observable<MemberWorkspace>{
    return this.httpClient.post<MemberWorkspace>(`${API_URL}member-workspace`,members)
  }

  findInWorkspace(string:string, workspaceId:any):Observable<MemberWorkspace[]>{
    return this.httpClient.get<MemberWorkspace[]>(`${API_URL}member-workspace/search/${string}/${workspaceId}`);
  }

  findByWorkspace(workspaceId:any,params:any):Observable<any>{
    return this.httpClient.get<any>(`${API_URL}member-workspace/${workspaceId}/workspace`,{params})
  }

}
