import {Member} from "./member";
import {Card} from "./card";
import {Reply} from "./reply";
import {User} from "./user";

export interface CommentCard {
  id?: number;
  content?: string;
  user?: User;
  card?: Card;
  replies?: Reply[];
}
