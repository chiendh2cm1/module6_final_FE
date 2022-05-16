import {Component, OnInit} from '@angular/core';
import {NavbarService} from "../../service/navbar/navbar.service";
import {ToastService} from "../../service/toast/toast.service";
import {AuthenticateService} from "../../service/authenticate.service";
import {Router} from "@angular/router";
import {User} from "../../model/user";
import {UserToken} from "../../model/user-token";
import {UserService} from "../../service/user/user.service";
import {AngularFireStorage} from "@angular/fire/compat/storage";
import {finalize} from "rxjs/operators";
import {NotificationService} from "../../service/notification/notification.service";
import {Notification} from "../../model/notification";
import {SearchResult} from "../../model/search-result";
import {BoardService} from "../../service/board/board.service";
import {RedirectService} from "../../service/redirect/redirect.service";
import {ChangePassword} from "../../model/change-password";
import {NgForm} from "@angular/forms";


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  changePassword: ChangePassword = {};
  currentUser: UserToken = {};
  loggedInUser!: User;
  id!: any;
  imgSrc: any;
  isSubmitted = false;
  selectedImage: any | undefined = null;
  searchResults: SearchResult[] = [];
  searchString: string = '';
  page = 1;
  count = 0;
  pageSize = 10;
  disabled = true;

  constructor(public navbarService: NavbarService,
              private toast: ToastService,
              private authenticateService: AuthenticateService,
              private router: Router,
              private storage: AngularFireStorage,
              private userService: UserService,
              private toastService: ToastService,
              public notificationService: NotificationService,
              private boardService: BoardService,
              private redirectService: RedirectService
  ) {
    this.authenticateService.currentUserSubject.subscribe(data => {
      this.currentUser = data;
      this.getUserById()
    })
  }

  ngOnInit(): void {
    this.navbarService.getCurrentUser()
    this.getUserById()
  }


  getUserById() {
    if (this.authenticateService.getCurrentUserValue() != null) {
      this.id = this.authenticateService.getCurrentUserValue().id;
      this.userService.getUserById(this.id).subscribe(user => {
        this.loggedInUser = user;
        if (this.loggedInUser.image == null) {
          this.loggedInUser.image = "https://vnn-imgs-a1.vgcloud.vn/image1.ictnews.vn/_Files/2020/03/17/trend-avatar-1.jpg";
        }
        this.imgSrc = this.navbarService.loggedInUser?.image;
      })
      this.findAllNotificationByUserId()
    }
  }

  logout() {
    this.authenticateService.logout();
    this.router.navigateByUrl("/login");
  }

  closeModalUpdate() {
    // @ts-ignore
    document.getElementById('modal-update-user').classList.remove('is-active')
  }

  openModalUpdate() {
    // @ts-ignore
    document.getElementById("modal-update-user").classList.add('is-active')
    this.getUserById()
  }

  updateUserInfo() {
    this.isSubmitted = true;
    if (this.selectedImage != null) {
      // @ts-ignore
      const filePath = `${this.selectedImage.name.split('.').slice(0, -1).join('.')}_${new Date().getTime()}`;
      const fileRef = this.storage.ref(filePath);
      this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(url => {
            this.imgSrc = url;
            this.loggedInUser.image = url;
            console.log(url);
            this.userService.updateById(this.id, this.loggedInUser).subscribe(() => {
                this.toastService.showMessage("Sửa thành công", 'is-success');
                this.navbarService.getCurrentUser();
                this.closeModalUpdate();
              },
              () => {
                this.toastService.showMessage("Thất bại !", 'is-danger');
              });
          });
        })).subscribe();
    } else {
      this.userService.updateById(this.id, this.loggedInUser).subscribe(() => {
          this.toastService.showMessage("Sửa thành công", 'is-success');
          this.navbarService.getCurrentUser();
          this.closeModalUpdate();
        },
        () => {
          this.toastService.showMessage("Thất bại !", 'is-danger');
        })
    }
  }

  showPreview(event: any) {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e: any) => this.imgSrc = event.target.result;
      reader.readAsDataURL(event.target.files[0]);
      this.selectedImage = event.target.files[0];
      if (this.selectedImage != null) {
        const filePath = `${this.selectedImage.name.split('.').splice(0, -1).join('.')}_${new Date().getTime()}`;
        const fileRef = this.storage.ref(filePath);
        this.storage.upload(filePath, this.selectedImage).snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              this.imgSrc = url;
            });
          })).subscribe();
      }
    } else {
      this.selectedImage = null;
    }
  }

  findAllNotificationByUserId() {
    if (this.currentUser.id != null) {
      this.notificationService.findAllByUser(this.currentUser.id).subscribe(data => {
        this.notificationService.notification = data;
        for (let notification of data) {
          if (!notification.status) {
            // this.notificationService.unreadNotice++
          }
        }
      })
    }
  }

  markReadNotification(notification: Notification) {
    if (notification.id != null && !notification.status) {
      notification.status = true;
      this.notificationService.updateNotification(notification.id, notification).subscribe(() => this.notificationService.unreadNotice--)
    }
  }

  markAllAsRead() {
    if (this.currentUser.id != null) {
      this.notificationService.markAllAsRead(this.currentUser.id).subscribe(() => {
        this.notificationService.unreadNotice = 0
        this.notificationService.findAllByUser(this.currentUser.id!).subscribe(notifications => this.notificationService.notification = notifications)
      })
    }
  }

  search() {
    const params = this.getRequestParam(this.page, this.pageSize)
    if (this.searchString == '') {
      this.searchResults = [];
    } else {
      if (this.currentUser != null) {
        this.boardService.findAllAvailableToSearcher(this.currentUser.id, this.searchString, params).subscribe(data => {
          let searchResults: SearchResult[] = [];
          for (let board of data.boards) {
            for (let column of board.columns) {
              for (let card of column.cards) {
                let keywordInCardTitle = card.title.toLowerCase().includes(this.searchString.toLowerCase());
                let keywordInCardContent = card.content.toLowerCase().includes(this.searchString.toLowerCase());
                if (keywordInCardTitle || keywordInCardContent) {
                  let searchResult: SearchResult = {
                    board: board,
                    column: column,
                    card: card,
                    preview: []
                  }
                  let exist: boolean = false
                  if (searchResults.length > 0) {
                    for (let search of searchResults) {
                      if (searchResult.card.id == search.card.id) {
                        exist = true
                      }
                      if (exist) {
                        break
                      }
                    }
                    if (!exist) {
                      searchResults.push(searchResult);
                    }
                  } else {
                    searchResults.push(searchResult);
                  }
                }
              }
            }
          }
          this.searchResults = searchResults;
        });
      }
    }
  }

  getRequestParam(page: number, pageSize: number) {
    let params: any = {};
    if (page) {
      params[`page`] = page - 1;
    }
    if (pageSize) {
      params[`size`] = pageSize;
    }
    return params
  }

  clearSearch(searchResult: SearchResult) {
    this.searchString = '';
    this.searchResults = [];
    this.redirectService.showModal(searchResult.card);
  }

  handlePageChange(event: any) {
    this.page = event;
  }

  createPreview(content: string, searchString: string): string[] {
    let index = content.toLowerCase().indexOf(searchString.toLowerCase());
    let beforeKeyword: string = content.substring(0, index);
    let keyword: string = content.substring(index, index + searchString.length);
    let afterKeyword: string = content.substring(index + searchString.length, content.length);
    return [beforeKeyword, keyword, afterKeyword]
  }

  openModalPassword() {
    // @ts-ignore
    document.getElementById("modal-password").classList.add('is-active')
    this.getUserById()
  }

  closeModalPassword() {
    // @ts-ignore
    document.getElementById('modal-password').classList.remove('is-active')
  }

  changePass(formChangePass: NgForm) {
    if (!this.checkRePassword()) {
      this.changePassword = formChangePass.value;
      this.userService.changePassword(this.changePassword).subscribe(
        (user) => {
          this.loggedInUser = user;
          formChangePass.reset();
          this.toastService.showMessage("Cập nhập thành công", "is-success");
        }, () => {
          this.toastService.showMessage("Cập nhập thất bại", "is-warning");
          formChangePass.reset();
        });
    } else {
      formChangePass.reset();
      this.toastService.showMessage("Mật khẩu không khớp", "is-warning");
    }
  }

  checkRePassword(): boolean {
    let rePassword = document.getElementById('confirmPassword') as HTMLInputElement;
    return rePassword.value == '';
  }

  checkConfirmPassWord() {
    let password = document.getElementById('newPassword') as HTMLInputElement;
    let rePassword = document.getElementById('confirmPassword') as HTMLInputElement;
    let result = '';
    if (password.value !== rePassword.value) {
      result = 'Mật khẩu không khớp';
    } else {
      result = '';
    }
    // @ts-ignore
    document.getElementById('confirm-password-error').innerHTML = result;
  }


}
