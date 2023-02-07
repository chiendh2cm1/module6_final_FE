import {Component, Input, OnInit} from '@angular/core';
import {Board} from "../../model/board";
import {ModalService} from "../../service/modal/modal.service";
import {BoardService} from "../../service/board/board.service";
import {UserToken} from "../../model/user-token";
import {AuthenticateService} from "../../service/authenticate.service";
import {ToastService} from "../../service/toast/toast.service";
import {Column} from "../../model/column";
import {ColumnService} from "../../service/column/column.service";
import {Workspace} from "../../model/workspace";
import {WorkspaceService} from "../../service/workspace/workspace.service";
import {DetailedMember} from "../../model/detailed-member";

@Component({
  selector: 'app-boards',
  templateUrl: './boards.component.html',
  styleUrls: ['./boards.component.css']
})
export class BoardsComponent implements OnInit {
  boards: Board[] = [];
  privateBoards: Board[] = [];
  publicBoards: Board[] = [];
  loggedInUser!: UserToken;
  workspaces: Workspace[] = [];
  workspace: Workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "Công nghệ", privacy: "Riêng tư"};

  constructor(private modalService: ModalService,
              private boardService: BoardService,
              private authenticateService: AuthenticateService,
              private toastService: ToastService,
              private columnService: ColumnService,
              private workspaceService: WorkspaceService) {
  }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getBoards()
    this.getAllWorkspace();
  }

  getBoards() {
    this.boardService.getOwnedBoard(this.loggedInUser.id!).subscribe(data => {
      this.boards = data
    })
  }

  getPrivateBoard(event: Board[]) {
    this.privateBoards = event;
  }

  getPublicBoard(event: Board[]) {
    this.publicBoards = event;
  }

  displayAddBoardModal() {
    document.getElementById('create-board')!.classList.add('is-active');
  }

  getAllWorkspace() {
    this.workspaceService.findAllByOwnerId(this.loggedInUser.id).subscribe(data => {
      this.workspaces = data;
    })
  }

}
