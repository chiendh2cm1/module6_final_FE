import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Column} from "../../model/column";
import {environment} from "../../../environments/environment";

const API_URL = `${environment.api_url}`

@Injectable({
  providedIn: 'root'
})
export class ColumnService {

  constructor(private httpClient: HttpClient) {
  }

  updateAColumn(id: any, column: Column): Observable<Column> {
    return this.httpClient.put<Column>(`${API_URL}columns/${id}`, column)
  }

  updateAllColumn(column: Column[]): Observable<Column[]> {
    return this.httpClient.put<Column[]>(`${API_URL}columns`, column)
  }

  deleteAColumn(id: any): Observable<Column[]> {
    return this.httpClient.delete<Column[]>(`${API_URL}columns/${id}`)
  }

  createAColumn(column: Column): Observable<Column> {
    return this.httpClient.post<Column>(`${API_URL}columns`, column)
  }

  getAllColumn(): Observable<Column[]> {
    return this.httpClient.get<Column[]>(`${API_URL}columns`)
  }
}
