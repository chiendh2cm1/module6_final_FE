import { Component, OnInit } from '@angular/core';
import {Workspace} from "../../../model/workspace";
import {WorkspaceService} from "../../../service/workspace/workspace.service";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthenticateService} from "../../../service/authenticate.service";
import {ToastService} from "../../../service/toast/toast.service";
import {MemberWorkspaceService} from "../../../service/member-workspace/member-workspace.service";
import {MemberService} from "../../../service/member/member.service";
import {NotificationService} from "../../../service/notification/notification.service";
import {UserService} from "../../../service/user/user.service";
import {UserToken} from "../../../model/user-token";
import {BoardService} from "../../../service/board/board.service";
import {User} from "../../../model/user";
import {Notification} from "../../../model/notification";
import {MemberWorkspace} from "../../../model/member-workspace";

@Component({
  selector: 'app-workspace-setting',
  templateUrl: './workspace-setting.component.html',
  styleUrls: ['./workspace-setting.component.css']
})
export class WorkspaceSettingComponent implements OnInit {
  workspace!: Workspace;
  workspaces: Workspace[] = [];
  loggedInUser!: UserToken;
  currentWorkspaceId: any;
  isAdmin:Boolean= false;
  isOwner:Boolean=false;
  workspaceOwner: User= {};
  workspaceMember: MemberWorkspace[] = [];
  currentUser!:User;
  constructor(private workspaceService: WorkspaceService,
              private userService: UserService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private authenticateService: AuthenticateService,
              private toastService: ToastService,
              private workspaceMemberService: MemberWorkspaceService,
              private memberService: MemberService,
              private notificationService: NotificationService,
              private boardService:BoardService) { }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.currentWorkspaceId = parseInt(paramMap.get('id')!)
      if (this.currentWorkspaceId != null) {
        this.getCurrentWorkspace(this.currentWorkspaceId);
      }
    });
    this.getCurrentUser()
  }
  getCurrentWorkspace(id: any) {
    this.workspaceService.findById(id).subscribe(data => {
      this.workspace = data;
      this.workspaceOwner = data.owner;
      this.workspaceMember = data.members;
      this.checkRole();
    })
  }
  getCurrentUser(){
    this.userService.getUserById(this.loggedInUser.id!).subscribe(data=>{
      this.currentUser = data
    })
  }
  deleteWorkspace(id: number) {
    this.boardService.deleteAllByWorkspace(this.workspace.boards).subscribe()
    this.workspaceService.deleteWorkspace(id).subscribe(() => {
      this.router.navigateByUrl(`/trello`)
    })
    this.createNotification(`đã xóa nhóm ${this.workspace.title}`)
    this.toastService.showMessage("Nhóm đã được xóa", "is-success")
  }

  showEditModal(){
    document.getElementById('edit-workspace')!.classList.add('is-active');
  }
  hideEditModal(){
    this.getCurrentWorkspace(this.currentWorkspaceId)
    document.getElementById('edit-workspace')!.classList.remove('is-active');
  }
  showEditPrivacyModal(){
    document.getElementById('edit-workspace-privacy')!.classList.add('is-active');
  }
  hideEditPrivacyModal(){
    this.getCurrentWorkspace(this.currentWorkspaceId);
    document.getElementById('edit-workspace-privacy')!.classList.remove('is-active');
  }
  showConfirmDeleteModal(){
    document.getElementById('confirm-delete')!.classList.add('is-active');
  }
  hideConfirmDeleteModal(){
    document.getElementById('confirm-delete')!.classList.remove('is-active');
  }

  updateWorkspace(){
    this.workspaceService.updateWorkspace(this.workspace.id,this.workspace).subscribe(data=>{
      this.workspace = data;
      this.hideEditModal();
      this.hideEditPrivacyModal()
    })
  }

  createNotification(notificationText: string) {
    let receivers: User[] = [];
    for (let member of this.workspace.members) {
      if (member.user) {
        receivers.push(member.user)
      }
    }
    let notification: Notification = {
      title: this.workspace.title,
      content: `${this.loggedInUser.username} ${notificationText} vào lúc ${this.notificationService.getTime()}`,
      url: "/trello",
      status: false,
      receiver: receivers,
      user: this.currentUser,
    }
    this.notificationService.saveNotification(notification)
  }

  checkRole() {
    if (this.loggedInUser.id == this.workspaceOwner.id) {
      this.isOwner = true;
    }
    for (let member of this.workspace.members) {
      if ((this.loggedInUser.id == member.user?.id && member.role == "Quản trị")) {
        this.isAdmin = true;
      }
    }
  }
}
