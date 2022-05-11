import {Board} from "./board";
import {Column} from "./column";
import {Card} from "./card";

export interface SearchResult {
  board: Board,
  column: Column,
  card: Card,
  preview: string[],
}
