import {Component, OnInit} from '@angular/core';
import {Workspace} from "../../../model/workspace";
import {WorkspaceService} from "../../../service/workspace/workspace.service";
import {UserService} from "../../../service/user/user.service";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {BoardService} from "../../../service/board/board.service";
import {AuthenticateService} from "../../../service/authenticate.service";
import {ToastService} from "../../../service/toast/toast.service";
import {UserToken} from "../../../model/user-token";
import {Board} from "../../../model/board";
import {NotificationService} from "../../../service/notification/notification.service";
import {MemberService} from "../../../service/member/member.service";
import {User} from "../../../model/user";
import {Notification} from "../../../model/notification";

@Component({
  selector: 'app-workspacehome',
  templateUrl: './workspace-home.component.html',
  styleUrls: ['./workspace-home.component.css']
})
export class WorkspaceHomeComponent implements OnInit {
  workspace!: Workspace;
  workspaces: Workspace[] = [];
  allowEdit: Boolean = false;
  loggedInUser!: UserToken;
  currentWorkspaceId!: number;
  newBoard: Board = {
    title: '',
    owner: {
      id: -1,
    },
    columns: [],
    type: '',
  };
  currentUser!:User;
  newWorkspace: Workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "", privacy: ""};

  constructor(private workspaceService: WorkspaceService,
              private userService: UserService,
              private activatedRoute: ActivatedRoute,
              private boardService: BoardService,
              private router: Router,
              private authenticateService: AuthenticateService,
              private toastService: ToastService,
              private notificationService: NotificationService,
              private memberService: MemberService) {
  }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getAllWorkspace();
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.currentWorkspaceId = parseInt(paramMap.get('id')!)
      if (this.currentWorkspaceId != null) {
        this.getCurrentWorkspace(this.currentWorkspaceId);
      }
      this.userService.getUserById(this.loggedInUser.id!).subscribe(data=>{
        this.currentUser = data;
        console.log(this.currentUser)
      })
    });
  }

  getCurrentWorkspace(id: any) {
    this.workspaceService.findById(id).subscribe(data => {
      this.workspace = data;
      this.checkRole(data);
    })
  }

  getAllWorkspace() {
    this.workspaceService.findAllByOwnerId(this.loggedInUser.id).subscribe(data => {
      this.workspaces = data;
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

  displayAddBoardModal() {
    document.getElementById('create-board')!.classList.add('is-active');
  }

  hideCreateBoard() {
    document.getElementById('create-board')!.classList.remove('is-active');
  }

  createNewBoard() {
    this.newBoard.owner = this.loggedInUser;
    this.boardService.addBoard(this.newBoard).subscribe(data => {
      this.toastService.showMessage("Bảng đã được tạo", "is-success");
      this.workspaceAddBoard(data)
      this.createNotificationBoard(`đã thêm ${data.title} vào nhóm ${this.workspace.title}`, data.id);
      this.resetInput();
      this.hideCreateBoard();
    })
  }

  workspaceAddBoard(board: Board) {
    this.workspace.boards.push(board);
    this.workspaceService.updateWorkspace(this.workspace.id, this.workspace).subscribe(() => {
      this.getCurrentWorkspace(this.currentWorkspaceId)
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

  showCreateWorkspaceModal() {
    document.getElementById('create-workspace')!.classList.add('is-active');
  }

  hideCreateWorkspaceModal() {
    this.resetWorkspaceInput()
    document.getElementById('create-workspace')!.classList.remove('is-active');
  }


  createWorkspace() {
    this.newWorkspace.owner = this.loggedInUser;
    this.workspaceService.createWorkspace(this.newWorkspace).subscribe(() => {
      this.getAllWorkspace();
      this.toastService.showMessage("Nhóm đã được tạo", 'is-success');
      this.hideCreateWorkspaceModal();
    })
  }

  resetWorkspaceInput() {
    this.newWorkspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "", privacy: ""};
  }

  createNotificationBoard(notification: string, boardId: any) {
    let receiver: User[] = [];
    for (let members of this.workspace.members) {
      receiver.push(members.user!);
    }
    let notify: Notification = {
      title: this.workspace.title,
      content: `${this.loggedInUser.username} ${notification} vào lúc ${this.notificationService.getTime()}`,
      url: `trello/board/${boardId}`,
      status: false,
      receiver: receiver,
      user: this.currentUser
    }
    this.notificationService.saveNotification(notify)
  }
}
