import {MemberWorkspace} from "./member-workspace";
import {Board} from "./board";

export interface Workspace {
  id: number;

  title: string;

  type: string

  owner: any;

  members: MemberWorkspace[];

  boards: Board[];

  privacy: string;
}
