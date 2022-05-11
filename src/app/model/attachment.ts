import {Card} from "./card";
import {Member} from "./member";

export interface Attachment {
  id?: number;
  member?: Member;
  source?: string;
  card?: Card;
  name?: any;
}
