import {Injectable} from '@angular/core';
import {Board} from "../../model/board";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";

const API_URL = `${environment.api_url}`

@Injectable({
  providedIn: 'root'
})
export class BoardService {


  constructor(private http: HttpClient) {
  }

  getAllBoard(): Observable<Board[]> {
    return this.http.get<Board[]>(`${API_URL}boards`)
  }

  getBoardById(id: number): Observable<Board> {
    return this.http.get<Board>(`${API_URL}boards/sort/${id}`)
  }

  findAllOwnedBoardsByUserId(id: any): Observable<Board[]> {
    return this.http.get<Board[]>(`${API_URL}users/${id}/owned-boards`);
  }

  findAllSharedBoardsByUserId(id: any): Observable<Board[]> {
    return this.http.get<Board[]>(`${API_URL}users/${id}/shared-boards`);
  }

  addBoard(board: Board): Observable<Board> {
    return this.http.post<Board>(`${API_URL}boards`, board)
  }

  updateBoard(id: number, board: Board): Observable<Board> {
    return this.http.put<Board>(`${API_URL}boards/${id}`, board)
  }

  deleteBoard(id: number): Observable<Board> {
    return this.http.delete<Board>(`${API_URL}boards/${id}`)
  }

  getBoardAvailableToUser(UserId: any): Observable<Board[]> {
    return this.http.get<Board[]>(`${API_URL}boards/available-to/${UserId}`)
  }

  getBoardByType(type: string): Observable<Board[]> {
    return this.http.get<Board[]>(`${API_URL}boards/type/${type}`)
  }

  getBoardByTypeAndUser(type: string, id: number): Observable<Board[]> {
    return this.http.get<Board[]>(`${API_URL}boards/owned/${type}/${id}`)
  }

  getOwnedBoard(id:number):Observable<Board[]>{
    return this.http.get<Board[]>(`${API_URL}boards/${id}/owned-boards`)
  }
  isBoardInWorkspace(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${API_URL}boards/${id}/is-in-workspace`);
  }
  deleteAllByWorkspace(boards: Board[]): Observable<Board> {
    return this.http.post<Board>(`${API_URL}boards/delete`,boards);
  }
  findAllAvailableToSearcher( searcherId: number | undefined,keyword:string, params:any): Observable<any> {
    return this.http.get<any>(`${API_URL}boards/available-to/${searcherId}/${keyword}`,{ params });
  }
}
