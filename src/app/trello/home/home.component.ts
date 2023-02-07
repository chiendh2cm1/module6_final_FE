import {Component, OnInit} from '@angular/core';
import {ModalService} from "../../service/modal/modal.service";
import {Board} from "../../model/board";
import {BoardService} from "../../service/board/board.service";
import {AuthenticateService} from "../../service/authenticate.service";
import {UserToken} from "../../model/user-token";
import {Workspace} from "../../model/workspace";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  boards: Board[] = [];
  loggedInUser!: UserToken;
  sharedBoards: Board[] = [];
  workspaces: Workspace[] = [];
  workspacesPublic: Workspace[] = [];
  workspace: Workspace = {
    boards: [],
    id: 0,
    members: [],
    owner: undefined,
    title: "",
    type: "Công nghệ",
    privacy: "Riêng tư"};

  constructor(private modalService: ModalService,
              private boardService: BoardService,
              private authenticateService: AuthenticateService,
              ) {
  }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getSharedBoards()
  }

  getBoards(event : Board[]) {
    this.boards = event;
  }

   getSharedBoards() {
    this.boardService.findAllSharedBoardsByUserId(this.loggedInUser.id).subscribe(
      data => this.sharedBoards = data);
  }

  getWorkspacePublic(event : Workspace[]) {
    this.workspacesPublic = event;
  }

  displayAddBoardModal() {
    document.getElementById('create-board')!.classList.add('is-active');
  }
}
