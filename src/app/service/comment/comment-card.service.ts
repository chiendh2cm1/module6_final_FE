import {Injectable} from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {CommentCard} from "../../model/comment-card";
import {Observable} from "rxjs";


const API_URL = `${environment.api_url}`

@Injectable({
  providedIn: 'root'
})
export class CommentCardService {

  constructor(private http: HttpClient) {
  }

  saveComment(commentCard: CommentCard): Observable<CommentCard> {
    return this.http.post<CommentCard>(`${API_URL}comments`, commentCard);
  }

  findAllByCardId(cardID: any): Observable<CommentCard[]> {
    return this.http.get<CommentCard[]>(`${API_URL}comments/comment-card/${cardID}`);
  }

  deleteComment(id: any): Observable<CommentCard>{
    return this.http.delete(`${API_URL}comments/${id}`);
  }

}
