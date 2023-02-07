import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
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
  @Input() workspace: Workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "Công nghệ", privacy: "Riêng tư"};
  @Output() boards = new EventEmitter<Board[]>();
  loggedInUser!: UserToken;
  allowEdit: Boolean = false;
  currentWorkspaceId!: number;
  @Output() privateBoards = new EventEmitter<Board[]>();
  @Output() publicBoards = new EventEmitter<Board[]>();
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
  constructor(private modalService: ModalService,
              private boardService: BoardService,
              private authenticateService: AuthenticateService,
              private toastService: ToastService,
              private workspaceService: WorkspaceService
              ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getBoards()
    this.getPublicBoard()
    this.getPrivateBoard()
  }

  getBoards() {
    this.boardService.getOwnedBoard(this.loggedInUser.id!).subscribe(data => {
      this.boards.emit(data);
    })
  }

  createNewBoard() {
    this.newBoard.owner = this.loggedInUser;
    this.boardService.addBoard(this.newBoard).subscribe(async data => {
      this.createdBoard = data
      this.toastService.showMessage("Tạo bảng thành công", "is-success");
      this.getBoards();
      this.workspaceAddBoard(data);
      this.resetInput();
      this.hideCreateBoard()
      this.getPublicBoard()
      this.getPrivateBoard()
    })
  }

  getPrivateBoard() {
    this.boardService.getBoardByTypeAndUser('Riêng tư', this.loggedInUser.id!).subscribe(data => {
      this.privateBoards.emit(data);
    })
  }

  getPublicBoard() {
    this.boardService.getBoardByType('Công khai').subscribe(data => {
      this.publicBoards.emit(data)
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

  workspaceAddBoard(board: Board) {
    this.workspace.boards.push(board);
    this.workspaceService.updateWorkspace(this.workspace.id, this.workspace).subscribe(() => {
      this.getCurrentWorkspace(this.currentWorkspaceId)
    })
  }

  getCurrentWorkspace(id: any) {
    this.workspaceService.findById(id).subscribe(data => {
      this.workspace = data;
      this.checkRole(data);
    })
  }

  checkRole(workspace: Workspace) {
    if (this.loggedInUser.id == workspace.owner.id) {
      this.allowEdit = true;
    }
    for (let member of this.workspace.members) {
      if ((this.loggedInUser.id == member.user?.id && (member.role == "Quản trị" || member.role == "Chỉnh sửa"))) {
        this.allowEdit = true
      }
    }
  }
}
