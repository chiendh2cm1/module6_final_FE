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
  sharedBoards: Board[] = [];
  workspaces: Workspace[] = [];
  workspacesPublic:Workspace[] = [];
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
  getAllWorkspace() {
    this.workspaceService.findAll().subscribe(data => {
      this.workspacesPublic = data;
    })
    this.workspaceService.findAllByOwnerId(this.loggedInUser.id).subscribe(data=>{
      this.workspaces = data;
    })
  }
  displayAddBoardModal() {
    document.getElementById('create-board')!.classList.add('is-active');
  }
}
