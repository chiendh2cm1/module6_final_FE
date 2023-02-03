import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../service/modal/modal.service";
import {Board} from "../../model/board";
import {ToastService} from "../../service/toast/toast.service";
import {BoardService} from "../../service/board/board.service";
import {UserService} from "../../service/user/user.service";
import {AuthenticateService} from "../../service/authenticate.service";
import {UserToken} from "../../model/user-token";
import {Workspace} from "../../model/workspace";
import {Column} from "../../model/column";
import {ColumnService} from "../../service/column/column.service";
import {WorkspaceService} from "../../service/workspace/workspace.service";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  boards: Board[] = [];
  privateBoards: Board[] = [];
  publicBoards: Board[] = [];
  loggedInUser!: UserToken;
  newBoard: Board = {
    title: '',
    owner: {
      id: -1,
    },
    columns: [],
    type: 'Riêng tư',
  };
  createdBoard?: Board
  workspaces: Workspace[] = [];
  workspace: Workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "Công nghệ", privacy: "Riêng tư"};

  constructor(private modalService: ModalService,
              private boardService: BoardService,
              private authenticateService: AuthenticateService,
              private toastService: ToastService
              ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getBoards()
    this.getPublicBoard()
    this.getPrivateBoard()
  }
  getBoards() {
    this.boardService.getOwnedBoard(this.loggedInUser.id!).subscribe(data => {
      this.boards = data
    })
  }

  getPrivateBoard() {
    this.boardService.getBoardByTypeAndUser('Riêng tư', this.loggedInUser.id!).subscribe(data => {
      this.privateBoards = data
    })
  }

  getPublicBoard() {
    this.boardService.getBoardByType('Công khai').subscribe(data => {
      this.publicBoards = data
    })
  }

  createNewBoard() {
    this.newBoard.owner = this.loggedInUser;
    this.boardService.addBoard(this.newBoard).subscribe(async data => {
      this.createdBoard = data
      this.toastService.showMessage("Tạo bảng thành công", "is-success");
      this.getBoards();
      this.getPublicBoard();
      this.getPrivateBoard();
      this.resetInput();
      this.hideCreateBoard()
    })
  }

  resetInput() {
    this.newBoard = {
      title: '',
      owner: {
        id: -1,
      },
      columns: [],
      type: ''
    };
  }

  hideCreateBoard() {
    document.getElementById('create-board')!.classList.remove('is-active');
  }
}
