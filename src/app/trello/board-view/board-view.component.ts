import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {BoardService} from "../../service/board/board.service";
import {AuthenticateService} from "../../service/authenticate.service";
import {ToastService} from "../../service/toast/toast.service";
import {UserService} from "../../service/user/user.service";
import {Board} from "../../model/board";
import {UserToken} from "../../model/user-token";
import {User} from "../../model/user";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {Column} from "../../model/column";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {ColumnService} from "../../service/column/column.service";
import {Card} from "../../model/card";
import {CardService} from "../../service/card/card.service";
import {TagService} from "../../service/tag/tag.service";
import {Tag} from "../../model/tag";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {finalize} from "rxjs/operators";
import {Attachment} from "../../model/attachment";
import {DetailedMember} from "../../model/detailed-member";
import {RedirectService} from "../../service/redirect/redirect.service";
import {AttachmentService} from "../../service/attachment/attachment.service";
import {MemberService} from "../../service/member/member.service";
import {Workspace} from "../../model/workspace";
import {WorkspaceService} from "../../service/workspace/workspace.service";
import {MemberWorkspace} from "../../model/member-workspace";
import {CommentCard} from "../../model/comment-card";
import {CommentCardService} from "../../service/comment/comment-card.service";
import {ActivityLog} from "../../model/activity-log";
import {NotificationService} from "../../service/notification/notification.service";
import {ActivityLogService} from "../../service/activityLog/activity-log.service";
import {Notification} from "../../model/notification";
@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss']
})
export class BoardViewComponent implements OnInit {
  private stompClient:any;
  disabled = true;
  commentCard: CommentCard = {}
  currentUser: User = {};
  fileSrc: any | undefined = null;
  selectedFile: any | undefined = null;
  isSubmitted = false;
  members: DetailedMember[] = [];
  membersUser: User[] = [];
  currentBoardId: number = -1;
  commentId = -1;
  tags: Tag[] = [];
  commentForm: FormGroup = new FormGroup({
    content: new FormControl('', Validators.required),
    cardId: new FormControl()
  })
  currentBoard: Board = {
    id: -1,
    owner: {},
    title: '',
    columns: []
  }
  loggedInUser: UserToken = {};
  user: User = {};
  canEdit: boolean = false;

  columnForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
  })

  createCardForm: FormGroup = new FormGroup({
    title: new FormControl('', Validators.required),
    content: new FormControl()
  })

  isAdded: boolean = false;
  selectedCard: Card = {
    id: -1,
    title: '',
    content: '',
    position: -1,
  }
  selectedCardAttachment: Attachment[] = []
  selectedColumn: Column = {
    cards: [],
    id: -1,
    position: -1,
    title: ""
  }
  selectedColumnID: number = -1;
  selectedIndex: number = -1;
  cardsDto: Card[] = [];
  columnsDto: Column[] = [];

  previousColumn: Column = {
    cards: [],
    id: -1,
    position: -1,
    title: ""
  };

  newTagForm: FormGroup = new FormGroup({
    color: new FormControl('', Validators.required),
    name: new FormControl(),
  })
  newAttachment: Attachment = {
    id: -1,
    source: ""
  }
  pendingAttachment: Attachment[] = [];
  pendingTag: Tag[] = [];
  selectedAttachmentId: number = -1;
  currentWorkspace!: Workspace;
  memberInWorkspace: MemberWorkspace[] = [];
  isBoardInWorkspace: boolean = false;
  isTagsIsShown: boolean = false;

  constructor(private activatedRoute: ActivatedRoute,
              private boardService: BoardService,
              public authenticationService: AuthenticateService,
              private router: Router,
              private toastService: ToastService,
              private userService: UserService,
              private columnService: ColumnService,
              private cardService: CardService,
              private tagService: TagService,
              private storage: AngularFireStorage,
              public redirectService: RedirectService,
              private attachmentService: AttachmentService,
              private memberService: MemberService,
              private workspaceService: WorkspaceService,
              private commentCardService: CommentCardService,
              private notificationService: NotificationService,
              private activityLogService: ActivityLogService) {
  }

  ngOnInit(): void {
    this.getCurrentBoardByURL()
  }

  //CARD

  dropCard(event: CdkDragDrop<Card[]>, column: Column) {
    if (!this.canEdit) {
      return
    }
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex);
    }
    this.setPreviousColumn(event);
    this.saveChange()
    if (this.previousColumn.id != column.id) {
      this.createNoticeInBoard(`di chuyển thẻ ${event.container.data[0].title} từ ${this.previousColumn.title} sang ${column.title}`)
      this.createNotification(` di chuyển thẻ ${event.container.data[0].title} từ ${this.previousColumn.title} sang ${column.title}`)
    }
  }

  updateCards() {
    this.cardService.updateCards(this.cardsDto).subscribe(() => this.updatePreviousColumn())
  }

  showCreateCardModal(column: Column) {
    this.selectedColumn = column;
    document.getElementById('createCardModal')!.classList.add('is-active')
  }


  createCard() {
    if (this.createCardForm.valid) {
      let newCard: Card = {
        title: this.createCardForm.get('title')?.value,
        content: this.createCardForm.get('content')?.value,
        position: this.selectedColumn.cards.length
      }
      this.resetCreateCardForm();
      this.cardService.createCard(newCard).subscribe(data => {
        if (this.pendingAttachment.length > 0) {
          for (let attachment of this.pendingAttachment) {
            attachment.card = data;
            this.attachmentService.addNewFile(attachment).subscribe(() => {
            })
          }
        }
        if (this.pendingTag.length > 0) {
          for (let tags of this.pendingTag) {
            data.tags?.push(tags);
          }
        }
        this.selectedColumn.cards.push(data)
        this.columnService.updateAColumn(this.selectedColumn.id, this.selectedColumn).subscribe()
        this.createNoticeCard(`đã thêm thẻ ${data.title}`, data)
        this.createNotification(` đã thêm thẻ ${data.title}`)
        this.closeCreateCardModal()
      })
    }
  }

  resetCreateCardForm() {
    this.createCardForm = new FormGroup({
      title: new FormControl('', Validators.required),
      content: new FormControl()
    })
  }

  closeCreateCardModal() {
    this.switchCreateTagsForm()
    this.resetCreateCardForm();
    this.selectedColumnID = -1;
    this.pendingAttachment = [];
    this.pendingTag = [];
    if (this.isTagsIsShown) {
      this.switchCreateTagsForm()
    }
    document.getElementById('createCardModal')!.classList.remove('is-active')
  }

  showEditCardModal(card: Card, column: Column) {
    this.getCurrentBoard()
    this.selectedCard = card;
    this.selectedColumn = column;
    this.createCardForm.get('title')?.setValue(card.title);
    this.createCardForm.get('content')?.setValue(card.content);
    this.redirectService.showModal(card)
    this.getSelectedCardAttachment();
    document.getElementById('editCardModal')!.classList.add('is-active')
  }

  editCard() {
    if(!this.canEdit){
      this.getCurrentBoard()
      return
    }
    this.selectedCard.title = this.createCardForm.get('title')?.value;
    this.selectedCard.content = this.createCardForm.get('content')?.value;
    this.resetCreateCardForm();
    this.cardService.updateCard(this.selectedCard.id, this.selectedCard).subscribe(() => {
      this.closeEditCardModal()
    })
  }

  closeEditCardModal() {
    this.getCurrentBoard()
    this.redirectService.hideCardModal();
    this.resetCreateCardForm();
    if (this.isTagsIsShown) {
      this.switchEditTagsForm()
    }
    document.getElementById('editCardModal')!.classList.remove('is-active')
  }

  showDeleteCardModal() {
    document.getElementById("delete-card-modal")!.classList.add("is-active")
  }

  deleteCard(id: any) {
    this.deleteAllComment();
    this.cardService.deleteCard(id).subscribe(data => {
        this.closeDeleteCardModal();
        this.closeEditCardModal();
        this.getCurrentBoard()
      }
    )
  }

  deleteAllComment() {
    for (let comment of this.redirectService.comments) {
      this.commentCardService.deleteComment(comment.id).subscribe()
    }
  }

  closeDeleteCardModal() {
    document.getElementById("delete-card-modal")!.classList.remove("is-active")
  }

  showDeleteCommentModal(id: any) {
    // @ts-ignore
    document.getElementById("deleteCommentModal").classList.add("is-active")
    this.commentId = id;
  }

  deleteComment() {
    let newCommentCard: CommentCard = {};
    for (let comment of this.redirectService.comments) {
      if (comment.id == this.commentId) {
        newCommentCard = comment;
        break;
      }
    }
    // @ts-ignore
    for (let reply of newCommentCard.replies) {
      // @ts-ignore
      this.replyService.deleteReplyById(reply.id).subscribe()
    }
    this.commentCardService.deleteComment(this.commentId).subscribe(() => {
        this.toastService.showMessage("Xóa thành công", 'is-success');
        this.getAllCommentByCardId();
        this.closeDeleteCommentModal();
        this.createNoticeInBoard(`xóa bình luận`);
      }
    )
  }

  createNoticeInBoard(activityText: string) {
    let activity: ActivityLog = {
      title: "Bảng: " + this.currentBoard.title,
      content: `${this.loggedInUser.username} ${activityText} lúc ${this.notificationService.getTime()}`,
      url: "/trello/boards/" + this.currentBoard.id,
      status: false,
      board: this.currentBoard,
      user: this.currentUser
    }
    this.activityLogService.saveNotification(activity, this.currentBoardId)
  }


  closeDeleteCommentModal() {
    // @ts-ignore
    document.getElementById("deleteCommentModal").classList.remove("is-active")
  }

  //END CARD

  //TAG
  showDeleteTag(id: number) {
    document.getElementById('tagDeleteButton-' + id)!.classList.remove('is-hidden');
  }

  hideDeleteTag(id: number) {
    document.getElementById('tagDeleteButton-' + id)!.classList.add('is-hidden');
  }

  showDeleteTags(id: number) {
    document.getElementById('tagsDeleteButton-' + id)!.classList.remove('is-hidden');
  }

  hideDeleteTags(id: number) {
    document.getElementById('tagsDeleteButton-' + id)!.classList.add('is-hidden');
  }

  addNewTag() {
    let tag: Tag = this.newTagForm.value;
    this.tagService.add(tag).subscribe(tag => {
      this.currentBoard.tags?.push(tag);
      this.boardDataUpdate();
      this.newTagForm = new FormGroup({
        color: new FormControl("is-primary"),
        name: new FormControl("")
      })
    })
  }

  switchEditTagsForm() {
    let tagForm = document.getElementById('editTags');
    if (tagForm!.classList.contains('is-hidden')) {
      tagForm!.classList.remove('is-hidden');
      this.isTagsIsShown = true
    } else {
      tagForm!.classList.add('is-hidden');
      this.isTagsIsShown = false
    }
  }

  switchCreateTagsForm() {
    let tagForm = document.getElementById('createTags');
    if (tagForm!.classList.contains('is-hidden')) {
      tagForm!.classList.remove('is-hidden');
      this.isTagsIsShown = true
    } else {
      tagForm!.classList.add('is-hidden');
      this.isTagsIsShown = false
    }
  }

  removeTagFromCard(tag: Tag) {
    if(!this.canEdit){
      return
    }
    for (let tags of this.selectedCard.tags!) {
      if (tags.id == tag.id) {
        let index = this.selectedCard.tags?.indexOf(tags);
        this.selectedCard.tags?.splice(index!, 1);
      }
    }
    this.cardService.updateCard(this.selectedCard.id, this.selectedCard).subscribe(() => {
      this.saveChange()
    })
  }

  addTagToCard(tag: Tag) {
    for (let tags of this.selectedCard.tags!) {
      if (tags.id == tag.id) {
        this.toastService.showMessage("Nhãn đã có trong thẻ", "is-danger")
        return
      }
    }
    this.selectedCard.tags?.push(tag);
    this.cardService.updateCard(this.selectedCard.id, this.selectedCard).subscribe(() => {
      this.saveChange()
    })
  }

  addTagToPending(tag: Tag) {
    for (let tags of this.pendingTag) {
      if (tags.id == tag.id) {
        this.toastService.showMessage("Nhãn đã có trong thẻ", "is-danger")
        return
      }
    }
    this.pendingTag.push(tag)
  }

  deleteTag(id: number) {
    for (let column of this.currentBoard.columns) {
      for (let card of column.cards) {
        for (let tag of card.tags!) {
          if (tag.id == id) {
            let deleteIndex = card.tags!.indexOf(tag);
            card.tags!.splice(deleteIndex, 1);
          }
        }
      }
    }
    for (let tag of this.currentBoard.tags!) {
      if (tag.id == id) {
        let deleteIndex = this.currentBoard.tags!.indexOf(tag);
        this.currentBoard.tags!.splice(deleteIndex, 1);
      }
    }
    this.saveChange();
  }

  //END TAG

  //ATTACHMENT

  showPreview(event: any) {
    this.toastService.showMessage("Đang tải file xin vui lòng chờ", "is-warning")
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => this.fileSrc = event.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedFile = event.target.files[0];
      if (this.selectedFile != null) {
        const filePath = `${this.selectedFile.name.split('.').splice(0, -1).join('.')}_${new Date().getTime()}`;
        const fileRef = this.storage.ref(filePath);
        this.storage.upload(filePath, this.selectedFile).snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              this.fileSrc = url;
            });
          })).subscribe();
      }
    } else {
      this.selectedFile = null;
    }
    this.uploadFile()
  }

  pendingPreview(event: any) {
    this.toastService.showMessage("Đang tải file xin vui lòng chờ", "is-warning")
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => this.fileSrc = event.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedFile = event.target.files[0];
      if (this.selectedFile != null) {
        const filePath = `${this.selectedFile.name.split('.').splice(0, -1).join('.')}_${new Date().getTime()}`;
        const fileRef = this.storage.ref(filePath);
        this.storage.upload(filePath, this.selectedFile).snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              this.fileSrc = url;
              this.pendingAttachment.push({
                source: this.fileSrc,
                name: this.selectedFile.name,
              })
            });
          })).subscribe();
      }
    } else {
      this.selectedFile = null;
    }
  }

  uploadFile() {
    this.isSubmitted = true;
    // let isMember = false;
    // for (let member of this.members) {
    //   if (member.userId == this.currentUser.id) {
    //     // @ts-ignore
    //     this.newAttachment.member = member;
    //     isMember = true;
    //     this.newAttachment.card = this.selectedCard
    //     break;
    //   }
    // }
    this.newAttachment.card = this.selectedCard
    if (this.canEdit && this.selectedFile != null) {
      const filePath = `${this.selectedFile.name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath, this.selectedFile).snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.fileSrc = url;
            this.newAttachment.source = url;
            this.newAttachment.name = `${this.selectedFile.name}`;
            this.newAttachment.card = this.selectedCard;
            this.attachmentService.addNewFile(this.newAttachment).subscribe(() => {
                this.toastService.showMessage("Upload success", 'is-success');
                this.getSelectedCardAttachment()
              },
              () => {
                this.toastService.showMessage("Fail !", 'is-danger');
              });
          });
        })).subscribe();
    }
  }

  getSelectedCardAttachment() {
    this.attachmentService.getAttachmentByCard(this.selectedCard.id).subscribe(data => {
      this.selectedCardAttachment = data;
    })
  }

  deletePendingAttachment(index: any) {
    for (let i = 0; i < this.pendingAttachment.length; i++) {
      if (this.pendingAttachment[index] == this.pendingAttachment[i]) {
        this.pendingAttachment.splice(index, 1);
        return
      }
    }
  }

  deleteAttachment() {
    this.attachmentService.deleteAttachmentById(this.selectedAttachmentId).subscribe(() => {
      this.getSelectedCardAttachment()
      this.hideDeleteAttachment()
    })
  }

  showDeleteAttachment(id: any) {
    this.selectedAttachmentId = id;
    document.getElementById('deleteAttachment')!.classList.add('is-active');
  }

  hideDeleteAttachment() {
    this.selectedAttachmentId = -1;
    document.getElementById('deleteAttachment')!.classList.remove('is-active');
  }

  //END ATTACHMENT

  //BOARD
  getCurrentBoardByURL() {
    this.loggedInUser = this.authenticationService.getCurrentUserValue();
    this.userService.getUserById(this.loggedInUser.id!).subscribe(data => {
      this.currentUser = data
    })
    this.activatedRoute.paramMap.subscribe((param: ParamMap) => {
      this.currentBoardId = parseInt(param.get('id')!)
      this.getCurrentBoard()
    })
  }

  getMembers() {
    this.memberService.getMembersByBoardId(this.currentBoard.id).subscribe(members => {
      this.members = members;
      for (let members of this.members) {
        this.getMemberUser(members.userId)
      }
      this.checkEditAllow()
    });
  }

  getMemberUser(id: any) {
    this.userService.getUserById(id).subscribe(data => {
      this.membersUser.push(data)
    })
  }

  getCurrentBoard() {
    this.boardService.getBoardById(this.currentBoardId).subscribe(board => {
      this.currentBoard = board;
      this.activityLogService.findAllByBoardId(this.currentBoardId).subscribe(data => {
        this.activityLogService.activities = data;
      })
      this.checkWorkspace(board);
      this.getMembers()
      this.checkEditAllow();
    })
  }

  checkEditAllow() {
    let userId = this.loggedInUser.id
    if (this.loggedInUser.id == this.currentBoard.owner.id) {
      this.canEdit = true;
    }
    if (this.isBoardInWorkspace) {
      if (this.currentBoard.type == "Riêng tư") {
        return;
      }
      if (this.currentWorkspace?.owner.id == this.loggedInUser.id) {
        this.canEdit = true;
        return;
      }
      for (let member of this.memberInWorkspace) {
        if (member.user?.id == this.loggedInUser.id) {
          if (member.role == "Quản trị" || member.role == "Chỉnh sửa") {
            this.canEdit = true;
          }
        }
      }
    }
  }

  checkWorkspace(board: Board) {
    this.boardService.isBoardInWorkspace(board.id!).subscribe(data => {
      this.isBoardInWorkspace = data;
      if (this.isBoardInWorkspace) {
        this.workspaceService.getCurrentWorkspaceID(this.currentBoard.id).subscribe(id => {
          this.workspaceService.findById(id).subscribe(workspace => {
            this.currentWorkspace = workspace;
            this.memberInWorkspace = workspace.members;
            this.checkEditAllow()
          })
        })
      }
    })
  }

  boardDataUpdate() {
    this.boardService.updateBoard(this.currentBoardId, this.currentBoard).subscribe(() => {
      this.getCurrentBoard()
    })
  }

  //END BOARD

  //COlUMN

  addColumn() {
    if (this.columnForm.valid) {
      let newColumn: Column = {
        cards: [],
        position: this.currentBoard.columns.length,
        title: this.columnForm.get('title')?.value
      }
      this.resetColumnForm();
      this.columnService.createAColumn(newColumn).subscribe(data => {
        this.currentBoard.columns.push(data)
        this.boardDataUpdate()
        this.createNoticeInBoard(`đã thêm danh sách ${data.title}`)
        this.createNotification(` đã thêm danh sách ${data.title}`)
        this.closeCreateColumnModal()
      })
    }
  }

  resetColumnForm() {
    this.columnForm = new FormGroup({
      title: new FormControl('', Validators.required),
    })
  }


  onFocusOut(column: Column) {
    if(!this.canEdit){
      this.getCurrentBoard()
      return
    }
    this.columnService.updateAColumn(column.id, column).subscribe(() => {
      this.boardDataUpdate()
    })
  }

  dropColumn(event: CdkDragDrop<string[]>) {
    if (!this.canEdit) {
      return
    }
    moveItemInArray(this.currentBoard.columns, event.previousIndex, event.currentIndex);
    this.saveChange()
    if (event.previousIndex != event.currentIndex) {
      this.createNoticeInBoard(`thay đổi vị trí của cột ${this.currentBoard.columns[event.previousIndex].title} với cột ${this.currentBoard.columns[event.currentIndex].title}`)
    }
  }


  private setPreviousColumn(event: CdkDragDrop<Card[]>) {
    let previousColumnId = parseInt(event.previousContainer.id);
    for (let column of this.currentBoard.columns) {
      if (column.id == previousColumnId) {
        this.previousColumn = column;
        break;
      }
    }
  }

  saveChange() {
    this.updatePosition();
  }

  private updatePosition() {
    for (let i = 0; i < this.currentBoard.columns.length; i++) {
      this.currentBoard.columns[i].position = i
      for (let j = 0; j < this.currentBoard.columns[i].cards.length; j++) {
        this.currentBoard.columns[i].cards[j].position! = j;
      }
    }
    this.updateDto();
  }

  private updateDto() {
    this.columnsDto = [];
    this.cardsDto = [];
    for (let column of this.currentBoard.columns) {
      this.columnsDto.push(column);
      for (let card of column.cards) {
        this.cardsDto.push(card);
      }
    }
    this.updateCards()
  }

  private updatePreviousColumn() {
    if (this.previousColumn.id != -1) {
      this.columnService.updateAColumn(this.previousColumn.id, this.previousColumn).subscribe(() => this.updateColumns())
    } else {
      this.updateColumns()
    }
  }

  updateColumns() {
    this.columnService.updateAllColumn(this.columnsDto).subscribe(() => {
      this.boardDataUpdate()
    })
  }

  deleteColumn() {
    for (let i = 0; i < this.currentBoard.columns.length; i++) {
      if (this.currentBoard.columns[i].id == this.selectedColumnID) {
        this.selectedIndex = this.currentBoard.columns.indexOf(this.currentBoard.columns[i])
        // // this.createNoticeInBoard(`xóa danh sách ${this.currentBoard.columns[i].title}`)
        // this.createNotification(` xóa danh sách ${this.currentBoard.columns[i].title}`)
        this.currentBoard.columns.splice(this.selectedIndex, 1);
        this.columnService.deleteAColumn(this.selectedColumnID).subscribe(() => {
          this.saveChange()
          this.closeDeleteColumnModal();
        })
      }
    }
  }

  showDeleteColumnModal(id: number) {
    this.selectedColumnID = id;
    document.getElementById('deleteColumnModal')!.classList.add('is-active')
  }

  closeDeleteColumnModal() {
    this.selectedColumnID = -1;
    this.selectedIndex = -1;
    document.getElementById('deleteColumnModal')!.classList.remove('is-active')
  }

  showCreateColumnModal() {
    document.getElementById('createColumnModal')!.classList.add("is-active")
  }

  closeCreateColumnModal() {
    document.getElementById('createColumnModal')!.classList.remove("is-active")
  }

  addComment() {
    if (this.commentForm.valid) {
      let commentCard: CommentCard = {
        content: this.commentForm.value.content,
        card: this.selectedCard,
        user: this.currentUser
      };
      this.commentForm = new FormGroup({
        content: new FormControl('', Validators.required)
      });
      this.commentCardService.saveComment(commentCard).subscribe(() => {
        this.redirectService.showModal(this.selectedCard)
        this.createNoticeCard(`đã bình luận vào thẻ ${this.selectedCard.title}`, this.selectedCard)
        this.createNotification(` đã bình luận vào thẻ ${this.selectedCard.title}`)
      })
    }
  }

  getAllCommentByCardId() {
    this.commentCardService.findAllByCardId(this.redirectService.card.id).subscribe(comments => {
      // @ts-ignore
      this.redirectService.comments = comments;
    })
  }

  displaySubmitCommentButton() {
    // @ts-ignore
    document.getElementById("submitComment-" + this.redirectService.card.id).classList.remove('is-hidden')
  }

  showSubmitCommentButton() {
    // @ts-ignore
    document.getElementById("submitComment-" + this.redirectService.card.id).classList.add('is-hidden')
  }

  get content() {
    return this.commentForm.get('content');
  }

  hiddenDeleteAttachmentConfirm() {
    // @ts-ignore
    document.getElementById('delete-attachment-confirm').classList.remove('is-active');
  }

  hiddenDeleteConfirm() {
    // @ts-ignore
    document.getElementById('delete-card-modal').classList.remove('is-active');
  }

  updateMembers(event: DetailedMember[]) {
    this.members = event;
    this.removeNonMembersFromCards();
  }

  private removeNonMembersFromCards() {
    for (let column of this.currentBoard.columns) {
      for (let card of column.cards) {
        // @ts-ignore
        for (let user of card.users) {
          if (!this.isBoardMember(user)) {
            // @ts-ignore
            let deleteIndex = card.users.indexOf(user);
            // @ts-ignore
            card.users.splice(deleteIndex, 1);
            // @ts-ignore
            this.createNoticeInBoard(`xóa thành viên ${card.users[deleteIndex].username}
                                      khỏi thẻ "${card.title}"`)
            this.createNotification(` xóa thành viên ${card.users![deleteIndex].username}
                                      khỏi thẻ "${card.title}"`)
          }
        }
      }
    }
    // this.saveChanges();
  }

  private isBoardMember(user: User): boolean {
    let isBoardMember = false;
    for (let member of this.members) {
      if (member.userId == user.id) {
        isBoardMember = true;
        break;
      }
    }
    return isBoardMember;
  }

  public saveChanges() {
    this.updatePositions();
    this.updateDto();
    this.updateCards();
  }

  private updatePositions() {
    let columns = this.currentBoard.columns;
    for (let i = 0; i < columns.length; i++) {
      let column = columns[i];
      column.position = i;
      let cards = column.cards;
      for (let j = 0; j < cards.length; j++) {
        cards[j].position = j;
      }
    }
  }

  toggleMemberForm() {
    let memberFormEle = document.getElementById('member-form');
    // @ts-ignore
    if (memberFormEle.classList.contains('is-hidden')) {
      // @ts-ignore
      memberFormEle.classList.remove('is-hidden');
    } else {
      // @ts-ignore
      memberFormEle.classList.add('is-hidden');
    }
  }


  private updateSelectedCard() {
    for (let column of this.currentBoard.columns) {
      for (let card of column.cards) {
        if (card.id == this.redirectService.card.id) {
          this.redirectService.card = card;
        }
      }
    }
  }

  createNoticeCard(activityText: string, card: Card) {
    let activity: ActivityLog = {
      title: "Bảng: " + this.currentBoard.title,
      content: `${this.currentUser.username} ${activityText} lúc ${this.notificationService.getTime()}`,
      url: "/trello/board/" + this.currentBoard.id,
      status: false,
      board: this.currentBoard,
      card: card,
      user: this.currentUser
    }
    this.activityLogService.saveNotification(activity, this.currentBoardId)

  }

  addUserToCard(member: DetailedMember) {
    this.updateSelectedCard();
    let isValid = true;
    // @ts-ignore
    for (let existingUser of this.redirectService?.card.users) {
      if (existingUser.id == member.userId) {
        isValid = false;
        return;
      }
    }
    if (isValid) {
      let user: User = {
        id: member.userId,
        username: member.username,
      }
      this.selectedCard.users?.push(user);
      this.cardService.updateCard(this.selectedCard.id, this.selectedCard).subscribe(() => {
      })
      this.createNoticeCard(`đã thêm "${user.username}" vào thẻ "${this.redirectService.card.title}"`, this.redirectService.card)
      this.createNotification(` đã thêm "${user.username}" vào thẻ "${this.redirectService.card.title}"`)
    }
  }

  removeUserFromCard(user: User) {
    if(!this.canEdit){
      return
    }
    this.updateSelectedCard()
    // @ts-ignore
    for (let existingUser of this.redirectService.card.users) {
      if (existingUser.id == user.id) {
        let username = user.username;
        // @ts-ignore
        let deleteIndex = this.redirectService.card.users.indexOf(existingUser);
        // @ts-ignore
        this.redirectService.card.users.splice(deleteIndex, 1);
        // @ts-ignore
        this.createNoticeInBoard(`xóa thành viên ${username} khỏi thẻ ${this.redirectService.card.title}`, this.redirectService.card)
        this.createNotification(` xóa thành viên ${username} khỏi thẻ ${this.redirectService.card.title}`)
      }
    }
  }

  createNotification(activity: any) {
    let receivers: User[] = [];
    if (this.currentUser.id != this.currentBoard.owner.id) {
      receivers.push(this.currentUser)
    }
    for (let member of this.membersUser) {
      if (this.currentUser.id == member.id) {
        continue
      }
      receivers.push(member)
    }
    console.log(receivers)
    let notification: Notification = {
      title: this.currentBoard.title,
      content: this.loggedInUser.username + activity + " lúc " + this.notificationService.getTime(),
      status: false,
      url: "/trello/board/" + this.currentBoard.id,
      receiver: receivers,
      user: this.loggedInUser
    }
    this.notificationService.saveNotification(notification)
    this.sendName()
  }

  filterBoard(event: number[][]) {
    let tagFilter: number[] = event[0];
    let memberFilter: number[] = event[1];
    let labelFilter: number[] = event[2];
    let hasFilter = !(tagFilter.length == 0 && memberFilter.length == 0 && labelFilter.length == 0)
    this.boardService.getBoardById(this.currentBoardId).subscribe(board => {
      this.currentBoard = board;
      if (hasFilter) {
        for (let column of this.currentBoard.columns) {
          for (let i = 0; i < column.cards.length; i++) {
            let card = column.cards[i];
            if (!this.isValidTag(card, tagFilter)) {
              column.cards.splice(i, 1);
              i--;
            } else if (!this.isValidMember(card, memberFilter)) {
              column.cards.splice(i, 1);
              i--;
            } else if (!this.isValidLabel(card, labelFilter)) {
              column.cards.splice(i, 1);
              i--;
            }
          }
        }
      }
    })
  }

  isValidMember(card: Card, memberFilter: number[]) {
    if (memberFilter.length == 0) return true;
    for (let userId of memberFilter) {
      let isInCard: boolean = false;
      // @ts-ignore
      for (let user of card.users) {
        if (userId == user.id) {
          isInCard = true;
          break;
        }
      }
      if (!isInCard) return false;
    }
    return true;
  }

  isValidTag(card: Card, tagFilter: number[]) {
    if (tagFilter.length == 0) return true;
    for (let tagId of tagFilter) {
      let isInCard: boolean = false;
      // @ts-ignore
      for (let tag of card.tags) {
        if (tagId == tag.id) {
          isInCard = true;
          break;
        }
      }
      if (!isInCard) return false;
    }
    return true;
  }

  isValidLabel(card: Card, labelFilter: number[]) {
    if (labelFilter.length == 0) return true;
    for (let labelId of labelFilter) {
      let isInCard: boolean = false;
      // @ts-ignore
      for (let tag of card.tags) {
        if (labelId == tag.id) {
          isInCard = true;
          break;
        }
      }
      if (!isInCard) return false;
    }
    return true;
  }
  setConnected(connected: boolean) {
    this.disabled = !connected;
  }


  sendName() {
    this.stompClient?.send(
      '/app/send',
      {},
    );
  }
}
