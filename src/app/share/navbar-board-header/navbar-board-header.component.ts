import {Component, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Board} from "../../model/board";
import {UserToken} from "../../model/user-token";
import {AuthenticateService} from "../../service/authenticate.service";
import {Router} from "@angular/router";
import {BoardService} from "../../service/board/board.service";
import {DetailedMember} from "../../model/detailed-member";
import {Tag} from "../../model/tag";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {User} from "../../model/user";
import {ActivityLogService} from "../../service/activityLog/activity-log.service";
import {RedirectService} from "../../service/redirect/redirect.service";
import {UserService} from "../../service/user/user.service";
import {Member} from "../../model/member";
import {MemberService} from "../../service/member/member.service";
import {ActivityLog} from "../../model/activity-log";
import {NotificationService} from "../../service/notification/notification.service";
import {EventEmitter} from '@angular/core';
import {Workspace} from "../../model/workspace";
import {MemberWorkspaceService} from "../../service/member-workspace/member-workspace.service";

@Component({
  selector: 'app-navbar-board-header',
  templateUrl: './navbar-board-header.component.html',
  styleUrls: ['./navbar-board-header.component.scss']
})
export class NavbarBoardHeaderComponent implements OnInit {
  @Input() workspace?: Workspace;
  @Input() currentBoard: Board = {columns: [], owner: {}, title: "", tags: []};
  @Input() canEdit: boolean = false;
  @Input() members: DetailedMember[] = [];
  @Input() tags: Tag[] = [];
  @Input() isInWorkspace: boolean = false;
  @Output() updateMemberEvent = new EventEmitter<DetailedMember[]>();
  @Output() filterEvent = new EventEmitter<number[][]>();
  selectedMember: DetailedMember = {boardId: -1, canEdit: false, id: -1, userId: -1, username: ""};
  currentUser: UserToken = this.authenticateService.getCurrentUserValue();
  searchBarIsShown: boolean = false;
  userSearch: string = ``;
  userResult: User[] = [];
  @Input()loggedInUser?:User
  tagFilter: number[] = [];
  memberFilter: number[] = [];
  labelFilter: number[] =[];
  constructor(public authenticateService: AuthenticateService,
              private userService: UserService,
              private router: Router,
              private boardService: BoardService,
              public activityLogService: ActivityLogService,
              public redirectService: RedirectService,
              private memberService: MemberService,
              public notificationService: NotificationService,
              private memberWorkspaceService:MemberWorkspaceService) {
  }

  ngOnInit() {
  }

  addMember(result: User) {
    let member: Member = {
      board: this.currentBoard,
      canEdit: false,
      user: result
    }
    this.memberService.addNewMember(member).subscribe(() => {
      this.resetSearch();
      this.getMembers();
    });
    this.createNoticeInBoard(`thêm ${member.user.username} vào bảng`)
    document.getElementById('addMember')!.classList.add('is-active');
  }

  private resetSearch() {
    this.searchBarIsShown = false;
    this.userSearch = ``;
    this.userResult = [];
  }

  private getMembers() {
    this.memberService.getMembersByBoardId(this.currentBoard.id).subscribe(members => {
      this.members = members;
      this.updateMemberEvent.emit(this.members);
    });
  }

  createNoticeInBoard(activityText: string) {
    let activity: ActivityLog = {
      title: "Bảng : " + this.currentBoard.title,
      content: this.currentUser.username + " " + activityText + " trong " + this.currentBoard.title + " " + "Vào : " + this.notificationService.getTime(),
      url: "/trello/board/" + this.currentBoard.id,
      status: false,
      board: this.currentBoard,
      user:this.currentUser
    }
    if (this.currentBoard.id != null) {
      this.activityLogService.saveNotification(activity, this.currentBoard.id)
    }
  }

  toggleUserSearchBar() {
    this.searchBarIsShown = !this.searchBarIsShown;
  }

  searchUsers() {
    if (this.userSearch != '') {
      if(this.isInWorkspace){
        this.userService.findByKeywordAndWorkspace(this.userSearch,this.workspace?.id).subscribe(users=>{
          console.log(users)
          this.userResult = users;
          this.cleanSearchResults();
        })
      } else {
        this.userService.findUsersByKeyword(this.userSearch).subscribe(users => {
          this.userResult = users;
          this.cleanSearchResults();
        });
      }
    } else {
      this.userResult = [];
    }
  }

  private cleanSearchResults() {
    for (let i = 0; i < this.userResult.length; i++) {
      let result = this.userResult[i];
      let toBeDeleted = false;
      if (result.id == this.currentBoard.owner.id) {
        toBeDeleted = true;
      } else {
        for (let member of this.members) {
          if (result.id == member.userId) {
            toBeDeleted = true;
            break;
          }
        }
      }
      if (toBeDeleted) {
        this.userResult.splice(i, 1);
        i--;
      }
    }
  }

  updateBoardTitle() {
    if (this.currentBoard.id != null) {
      this.boardService.updateBoard(this.currentBoard.id, this.currentBoard).subscribe(data => {
        this.currentBoard = data
      })
    }
  }

  showDetail(member: DetailedMember) {
    this.selectedMember = member;
    // @ts-ignore
    document.getElementById('user-detail-modal').classList.add('is-active');
  }

  showUserPreview(member: DetailedMember) {
    let elementId = 'user-preview-text-' + member.userId;
    let element = document.getElementById(elementId);
    // @ts-ignore
    element.innerHTML = '@' + member.username;
    // @ts-ignore
    element.classList.remove('is-hidden');
  }

  closeUserPreviews() {
    let elements = document.getElementsByClassName('user-preview-text');
    // @ts-ignore
    for (let element of elements) {
      element.classList.add('is-hidden');
    }
  }

  showAllMembers() {
    let members = document.getElementsByClassName('user-preview');
    // @ts-ignore
    for (let member of members) {
      member.classList.remove('is-hidden');
    }
  }

  toggleDeleteBoardModal() {
    let modalEle = document.getElementById('delete-board-modal');
    // @ts-ignore
    if (modalEle.classList.contains('is-active')) {
      // @ts-ignore
      modalEle.classList.remove('is-active');
    } else {
      // @ts-ignore
      modalEle.classList.add('is-active');
    }
  }

  toggleMenu() {
    let dropdownEle = document.getElementById('menu-btn-dropdown');
    // @ts-ignore
    if (dropdownEle.classList.contains('is-hidden')) {
      // @ts-ignore
      dropdownEle.classList.remove('is-hidden');
    } else {
      // @ts-ignore
      dropdownEle.classList.add('is-hidden');
    }
  }

  closeModal() {
    // @ts-ignore
    document.getElementById('user-detail-modal').classList.remove('is-active');
  }

  removeSelectedMember() {
    let username = this.selectedMember.username;
    this.memberService.deleteMember(this.selectedMember.id).subscribe(() => {
      // @ts-ignore
      this.createNoticeInBoard(`đã xóa ${username} khỏi bảng`)
      this.getMembers();
      this.closeModal();
    });
  }

  makeSelectedMemberObserver() {
    this.selectedMember.canEdit = false;
    this.updateSelectedMember();
    this.createNoticeInBoard("đã tước quyền " + this.selectedMember.username)
  }

  makeSelectedMemberEditor() {
    this.selectedMember.canEdit = true;
    this.updateSelectedMember();
    this.createNoticeInBoard("cho phép " + this.selectedMember.username + "chỉnh sửa")
  }

  updateSelectedMember() {
    let member: Member = {
      board: this.currentBoard,
      canEdit: this.selectedMember.canEdit,
      id: this.selectedMember.id,
      user: {
        id: this.selectedMember.userId
      }
    };
    this.memberService.updateMember(this.selectedMember.id, member).subscribe(
      () => this.getMembers()
    );
  }

  removeThisBoard() {
    if (this.currentBoard.id != null) {
      this.boardService.deleteBoard(this.currentBoard.id).subscribe(() => this.router.navigateByUrl('/trello'));
    }
    this.createNoticeInBoard("xóa bảng")
  }

  filterBoard() {
    this.updateFilterDto();
    this.filterEvent.emit([this.tagFilter, this.memberFilter, this.labelFilter]);
  }

  private updateFilterDto() {
    this.tagFilter = [];
    this.memberFilter = [];
    this.labelFilter = [] ;

    let tagOptionElements = document.getElementsByClassName('tag-filter-option');
    // @ts-ignore
    for (let tagOptionElement of tagOptionElements) {
      if (tagOptionElement.checked) {
        this.tagFilter.push(tagOptionElement.value);
      }
    }
    let memberOptionElements = document.getElementsByClassName('member-filter-option');
    // @ts-ignore
    for (let memberOptionElement of memberOptionElements) {
      if (memberOptionElement.checked) {
        this.memberFilter.push(memberOptionElement.value);
      }
    }
    let labelOptionElements = document.getElementsByClassName('label-filter-option');
    // @ts-ignore
    for (let labelOptionElement of labelOptionElements) {
      if (labelOptionElement.checked) {
        this.labelFilter.push(labelOptionElement.value);
      }
    }
  }

  clearFilterBoard() {
    this.filterEvent.emit([[], []]);
    this.clearCheckedOptions();
  }

  private clearCheckedOptions() {
    let optionElements = document.getElementsByClassName('filter-option');
    // @ts-ignore
    for (let optionElement of optionElements) {
      if (optionElement.checked) {
        optionElement.checked = false;
      }
    }
  }


  toggleElement(elementId: string) {
    let element = document.getElementById(elementId);
    // @ts-ignore
    if (element.classList.contains('is-hidden')) {
      // @ts-ignore
      element.classList.remove('is-hidden');
    } else {
      // @ts-ignore
      element.classList.add('is-hidden');
    }
  }
}
