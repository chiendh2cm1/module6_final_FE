import {Board} from "./board";
import {Card} from "./card";
import {User} from "./user";

export interface ActivityLog {
  id?: number;
  title?: string;
  content?: string;
  url?: string;
  status?: boolean;
  board?: Board;
  card?: Card;
  user?: User;
}
