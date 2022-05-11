import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Card} from "../../model/card";
import {Observable} from "rxjs";
import {environment} from "../../../environments/environment";
const API_URL = `${environment.api_url}`
@Injectable({
  providedIn: 'root'
})
export class CardService {

  constructor(private httpClient: HttpClient) {
  }

  createCard(card: Card): Observable<Card> {
    return this.httpClient.post<Card>(`${API_URL}cards`,card)
  }
  updateCard(id:any,card:Card):Observable<Card>{
    return this.httpClient.put<Card>(`${API_URL}cards/${id}`,card)
  }
  updateCards(card:Card[]):Observable<Card[]>{
    return this.httpClient.put<Card[]>(`${API_URL}cards`,card)
  }
  deleteCard(id:any):Observable<Card>{
    return this.httpClient.delete<Card>(`${API_URL}cards/${id}`)
  }
}
