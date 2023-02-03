import { Component, OnInit } from '@angular/core';
import {Board} from "../../model/board";
import {UserToken} from "../../model/user-token";
import {Workspace} from "../../model/workspace";
import {ModalService} from "../../service/modal/modal.service";
import {BoardService} from "../../service/board/board.service";
import {AuthenticateService} from "../../service/authenticate.service";
import {ToastService} from "../../service/toast/toast.service";
import {ColumnService} from "../../service/column/column.service";
import {WorkspaceService} from "../../service/workspace/workspace.service";

@Component({
  selector: 'app-modalworkspace',
  templateUrl: './modalworkspace.component.html',
  styleUrls: ['./modalworkspace.component.css']
})
export class ModalworkspaceComponent implements OnInit {
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
              private workspaceService: WorkspaceService) { }

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
      this.toastService.showMessage("Tạo nhóm thành công", 'is-success');
      this.hideCreateWorkspaceModal();
    })
  }

  resetWorkspaceInput() {
    this.workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "", privacy: ""};
  }

}
