import {Component, OnInit} from '@angular/core';
import {ModalService} from "../../service/modal/modal.service";
import {Board} from "../../model/board";
import {BoardService} from "../../service/board/board.service";
import {AuthenticateService} from "../../service/authenticate.service";
import {UserToken} from "../../model/user-token";
import {ToastService} from "../../service/toast/toast.service";
import {Column} from "../../model/column";
import {ColumnService} from "../../service/column/column.service";
import {Workspace} from "../../model/workspace";
import {WorkspaceService} from "../../service/workspace/workspace.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  boards: Board[] = [];
  loggedInUser!: UserToken;
  yourBoards: Board[] = [];
  sharedBoards: Board[] = [];
  newBoard: Board = {
    title: '',
    owner: {
      id: -1,
    },
    columns: [],
    type: '',
  };

  createdBoard?: Board
  workspaces: Workspace[] = [];
  workspacesPublic:Workspace[] = [];
  workspace: Workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "", privacy: ""};

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
    this.getSharedBoards()
  }

  getBoards() {
    this.boardService.getOwnedBoard(this.loggedInUser.id!).subscribe(data => {
      this.boards = data;
    })
  }

   getSharedBoards() {
    this.boardService.findAllSharedBoardsByUserId(this.loggedInUser.id).subscribe(
      data => this.sharedBoards = data);
  }


  createNewBoard() {
    this.newBoard.owner = this.loggedInUser;
    this.boardService.addBoard(this.newBoard).subscribe(async data => {
      this.createdBoard = data
      await this.premadeColumnInBoard("Công việc", 0, this.createdBoard!);
      await this.premadeColumnInBoard("Sẽ làm", 1, this.createdBoard!);
      await this.premadeColumnInBoard("Đang làm", 2, this.createdBoard!);
      await this.premadeColumnInBoard("Đã xong", 3, this.createdBoard!);
      await this.toastService.showMessage("Bảng đã được tạo", "is-success");
      await this.getBoards()
      await this.resetInput();
      await this.hideCreateBoard()
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

  hideCreateBoard() {
    this.resetInput();
    document.getElementById('create-board')!.classList.remove('is-active');
  }

  showCreateWorkspaceModal() {
    document.getElementById('create-workspace')!.classList.add('is-active');
  }

  hideCreateWorkspaceModal() {
    this.resetWorkspaceInput()
    document.getElementById('create-workspace')!.classList.remove('is-active');
  }

  getAllWorkspace() {
    this.workspaceService.findAll().subscribe(data => {
      this.workspacesPublic = data;
    })
    this.workspaceService.findAllByOwnerId(this.loggedInUser.id).subscribe(data=>{
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
