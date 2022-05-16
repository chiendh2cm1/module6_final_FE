import {Component, OnInit} from '@angular/core';
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
              private toastService: ToastService,
              private columnService: ColumnService,
              private workspaceService: WorkspaceService) {
  }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getBoards()
    this.getPublicBoard()
    this.getPrivateBoard()
    this.getAllWorkspace();
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

  displayAddBoardModal() {
    document.getElementById('create-board')!.classList.add('is-active');
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

  updateCreatedBoard() {
    this.boardService.updateBoard(this.createdBoard?.id!, this.createdBoard!).subscribe(() => {
      this.getBoards()
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

  premadeColumnInBoard(title: string, position: number, board: Board) {
    let column: Column = {
      cards: [],
      position: position,
      title: title
    }
    this.columnService.createAColumn(column).subscribe(data => {
      board.columns.push(data);
      this.updateCreatedBoard();
    })
  }
  showCreateWorkspaceModal() {
    document.getElementById('create-workspace')!.classList.add('is-active');
  }

  hideCreateWorkspaceModal() {
    this.resetWorkspaceInput()
    document.getElementById('create-workspace')!.classList.remove('is-active');
  }

  getAllWorkspace() {
    this.workspaceService.findAllByOwnerId(this.loggedInUser.id).subscribe(data => {
      this.workspaces = data;
    })
  }

  createWorkspace() {
    this.workspace.owner = this.loggedInUser;
    this.workspaceService.createWorkspace(this.workspace).subscribe(()=>{
      this.getAllWorkspace();
      this.toastService.showMessage("Nhóm đã được tạo", 'is-success');
      this.hideCreateWorkspaceModal();
    })
  }

  resetWorkspaceInput() {
    this.workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "", privacy: ""};
  }
}
