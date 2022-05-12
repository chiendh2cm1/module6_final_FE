import {Component, OnInit} from '@angular/core';
import {WorkspaceService} from "../../../service/workspace/workspace.service";
import {UserToken} from "../../../model/user-token";
import {Workspace} from "../../../model/workspace";
import {User} from "../../../model/user";
import {UserService} from "../../../service/user/user.service";
import {ActivatedRoute, Router} from "@angular/router";
import {BoardService} from "../../../service/board/board.service";
import {AuthenticateService} from "../../../service/authenticate.service";
import {ToastService} from "../../../service/toast/toast.service";
import {MemberWorkspace} from "../../../model/member-workspace";
import {MemberWorkspaceService} from "../../../service/member-workspace/member-workspace.service";
import {MemberService} from "../../../service/member/member.service";
import {NotificationService} from "../../../service/notification/notification.service";
import {Notification} from "../../../model/notification";

@Component({
  selector: 'app-workspacemembers',
  templateUrl: './workspace-members.component.html',
  styleUrls: ['./workspace-members.component.css']
})
export class WorkspaceMembersComponent implements OnInit {
  loggedInUser!: UserToken;
  workspace!: Workspace;
  workspaces: Workspace[] = [];
  allowEdit: Boolean = false;
  isAdmin:Boolean = false;
  user: User = {};
  userSearchResult: User[] = [];
  currentWorkspaceId!: number;
  pendingAddMember: User[] = [];
  pendingMember: User = {};
  pendingMemberRole: string = "Chỉ xem";
  isOwner: Boolean = false;
  workspaceOwner!: User;
  memberInWorkspace: MemberWorkspace[] = [];
  newWorkspace: Workspace = {boards: [], id: 0, members: [], owner: undefined, title: "", type: "", privacy: ""};

  page = 1;
  count = 0;
  pageSize = 20;
  constructor(private workspaceService: WorkspaceService,
              private userService: UserService,
              private activatedRoute: ActivatedRoute,
              private boardService: BoardService,
              private router: Router,
              private authenticateService: AuthenticateService,
              private toastService: ToastService,
              private workspaceMemberService: MemberWorkspaceService,
              private memberService: MemberService,
              private notificationService: NotificationService) {
  }

  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
    this.getAllWorkspace();
    this.activatedRoute.paramMap.subscribe(paramMap => {
      this.currentWorkspaceId = parseInt(paramMap.get('id')!)
      if (this.currentWorkspaceId != null) {
        this.getCurrentWorkspace(this.currentWorkspaceId);
        this.getAllWorkspace();
        this.getMemberInWorkspace()
      }
    });
  }

  getCurrentWorkspace(id: any) {
    this.workspaceService.findById(id).subscribe(data => {
      this.workspace = data;
      this.workspaceOwner = data.owner
      this.memberInWorkspace = data.members
      this.checkRole(data);
    })
  }

  checkRole(workspace: Workspace) {
    if (this.loggedInUser.id == workspace.owner.id) {
      this.allowEdit = true;
      this.isOwner = true;
    }
    for (let member of this.workspace.members) {
      if ((this.loggedInUser.id == member.user?.id && member.role == "Quản trị")) {
        this.allowEdit = true
        this.isAdmin = true;
      } else if ((this.loggedInUser.id == member.user?.id && member.role == "Chỉnh sửa")){
        this.allowEdit = true
      }
    }
  }

  getAllWorkspace() {
    this.workspaceService.findAllByOwnerId(this.loggedInUser.id).subscribe(data => {
      this.workspaces = data;
    })
  }

  findAllUserByUsername(username: string) {
    this.user.username = username;
    if (username != "") {
      this.userService.findUsersByKeyword(username).subscribe(data => {
        for (let member of this.workspace.members) {
          for (let user of data) {
            if (member.user?.id == user.id) {
              data.splice(data.indexOf(user), 1)
            }
          }
        }
        for (let member of this.pendingAddMember) {
          for (let user of data) {
            if (member.id == user.id) {
              data.splice(data.indexOf(user), 1)
            }
          }
        }
        this.userSearchResult = data;
      })
    } else if (username == "") {
      this.userSearchResult = []
    }
  }

  selectUser(username: any, user: User) {
    username.value = "";
    this.pendingAddMember.push(user)
    this.userSearchResult = []
  }
  removePendingUser(index: any) {
    this.pendingAddMember.splice(index, 1)
  }

  searchMembers(username: string) {
    if (username != "") {
      this.workspaceMemberService.findInWorkspace(username, this.workspace.id).subscribe(memberWorkspace => {
        this.memberInWorkspace = memberWorkspace;
      })
    } else {
      this.memberInWorkspace = this.workspace.members;
    }
  }

  removeMembers(index: any, member: MemberWorkspace) {
    let removeMember: MemberWorkspace[] = this.workspace.members.splice(index, 1);
    this.workspaceService.updateWorkspace(this.workspace.id, this.workspace).subscribe();
    for (let board of this.workspace.boards) {
      for (let member of removeMember) {
        this.memberService.deleteMemberBoardWorkspace(board.id, member.user?.id).subscribe()
      }
    }
    this.workspaceMemberService.deleteWorkspaceMembers(removeMember).subscribe(() => {
    })
    this.createNotificationRemovedFromWorkSpace(member);
    if (this.loggedInUser.id == member.user?.id) {
      this.router.navigateByUrl('')
    }
  }

  updateMember(member: MemberWorkspace, role: string) {
    member.role = role;
    this.workspaceMemberService.updateWorkspaceMember(member.id, member).subscribe()
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

  showSingleInvite() {
    document.getElementById('single-invite')!.classList.add('is-active');
  }

  hideSingleInvite() {
    this.pendingMember = {};
    this.pendingMemberRole = 'Chỉ xem';
    document.getElementById('single-invite')!.classList.remove('is-active');
  }

  selectSingleUser(username: any, user: User) {
    username.value = ''
    this.pendingMember = user
    this.userSearchResult = []
  }

  addSingleMember(role: string) {
    if (this.pendingMember != null) {
      let newMember: MemberWorkspace = {
        user: this.pendingMember,
        role: role
      }
      this.workspaceMemberService.addWorkspaceMember(newMember).subscribe(data => {
        this.workspace.members.push(data)
        this.workspaceService.updateWorkspace(this.workspace.id, this.workspace).subscribe()
      })
      this.createNotificationInvitedToWorkspace(newMember)
      this.toastService.showMessage("Mời thành công", "is-success");
      this.pendingMember = {};
      this.hideSingleInvite()
    }
  }

  createNotificationAddToWorkspace() {
    let receivers: User[] = [];
    for (let member of this.pendingAddMember) {
      receivers.push(member)
    }
    let notification: Notification = {
      title: this.workspace.title,
      content: this.loggedInUser.username + ` đã thêm bạn vào nhóm ${this.workspace.title} với quyền chỉ xem vào lúc ` + this.notificationService.getTime(),
      status: false,
      url: "/trello/workspaces/" + this.workspace.id,
      receiver: receivers,
      user:this.loggedInUser
    }
    this.notificationService.saveNotification(notification)
  }

  createNotificationInvitedToWorkspace(member: MemberWorkspace) {
    let receivers: User[] = [];
    if (this.pendingMember != null) {
      receivers.push(this.pendingMember)
    }
    let notification: Notification = {
      title: this.workspace.title,
      content: this.loggedInUser.username + ` đã thêm bạn vào nhóm ${this.workspace.title} với quyền ${member.role} vào lúc ` + this.notificationService.getTime(),
      status: false,
      url: "/trello/workspaces/" + this.workspace.id,
      receiver: receivers,
      user:this.loggedInUser
    }
    this.notificationService.saveNotification(notification)
  }

  createNotificationRemovedFromWorkSpace(member: MemberWorkspace) {
    let receivers: User[] = [];
    receivers.push(member.user!)
    let notification: Notification = {
      title: this.workspace.title,
      content: this.loggedInUser.username + ` đã đá bạn ra khỏi nhóm ${this.workspace.title} vào lúc ` + this.notificationService.getTime(),
      status: false,
      url: "",
      receiver: receivers,
      user:this.loggedInUser
    }
    this.notificationService.saveNotification(notification)
  }

  getRequestParam(page: number, pageSize:number){
    let params:any = {};
    if(page){
      params[`page`]=page-1;
    }
    if(pageSize){
      params[`size`]=pageSize;
    }
    return params
  }

  getMemberInWorkspace(){
    const params = this.getRequestParam(this.page, this.pageSize);
    this.workspaceMemberService.findByWorkspace(this.currentWorkspaceId,params).subscribe(data=>{
      this.memberInWorkspace = data.members;
      this.count = data.totalItems;
    })
  }

  handlePageChange(event:any){
    this.page = event;
    this.getMemberInWorkspace()
  }

  handlePageSizeChange(event: any): void {
    this.pageSize = event.target.value;
    this.page = 1;
    this.getMemberInWorkspace();
  }

}
