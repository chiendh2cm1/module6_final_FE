import { Component, OnInit } from '@angular/core';
import {User} from "../model/user";
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {UserService} from "../service/user/user.service";
import {Router} from "@angular/router";
import {ToastService} from "../service/toast/toast.service";

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.css']
})
export class RecoverPasswordComponent implements OnInit {
  user: User = {};
  divNewPassword = false;
  isConfirmPassword = false;
  confirmPassword = '';
  conFirmForm: FormGroup = new FormGroup({
    username: new FormControl(),
    email: new FormControl(),
  });

  newConFirmForm: FormGroup = this.formBuilder.group({});

  finalConfirmForm: FormGroup = new FormGroup({});

  constructor(private userService: UserService,
              private formBuilder: FormBuilder,
              private router: Router,
              private toastService: ToastService) { }

  ngOnInit(): void {
  }
  confirm() {
    this.userService.getUserByUserNameAndEmail(this.conFirmForm.get('username')?.value, this.conFirmForm.get('email')?.value).subscribe(user => {
      this.user = user;
      if (this.user != null) {
        this.divNewPassword = true;
        this.newConFirmForm = this.formBuilder.group({
          username: new FormControl(this.user.username, [Validators.required, Validators.minLength(6)]),
          email: new FormControl(this.user.email,[Validators.required, Validators.pattern('^[a-zA-z][A-Za-z0-9_\\.]{3,32}@[a-z0-9A-Z]{2,}(\\.[A-Za-z0-9]{2,4}){1,2}$')]),
          newPassword: new FormControl('', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{3,100}$')]),
          confirmPassword: new FormControl('', [Validators.required, Validators.pattern('^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{3,10}$')]),
          nickname: new FormControl(this.user.nickname),
        });
      } else {
        this.toastService.showMessage('Tên tài khoản hoặc email không đúng!', 'is-warning');
      }
    })
  }
  changeNewPassword(id: any) {
    if (this.newConFirmForm.value.newPassword != this.newConFirmForm.value.confirmPassword) {
      this.isConfirmPassword = true;
      this.finalConfirmForm = new FormGroup({
        id: new FormControl(this.user.id),
        username: new FormControl(this.user.username),
        email: new FormControl(this.user.email),
        password: new FormControl(this.newConFirmForm.value.newPassword),
        nickname: new FormControl(this.user.nickname),
      })
    } else {
      let user: User = {
        id: this.user.id,
        username: this.user.username,
        password: this.newConFirmForm.value.newPassword,
        email: this.user.email,
        image: this.user.image,
        nickname: this.user.nickname,
        roles: this.user.roles,
      }
      this.userService.updateByIdRecover(id, user).subscribe(() => {
        this.toastService.showMessage('Thay đổi mật khẩu thành công!', 'is-success');
        this.router.navigateByUrl('/login')
      })
    }
  }
  get newPassword() {
    return this.newConFirmForm.get('newPassword');
  }

  get newConfirmPassword() {
    return this.newConFirmForm.get('confirmPassword');
  }

}
