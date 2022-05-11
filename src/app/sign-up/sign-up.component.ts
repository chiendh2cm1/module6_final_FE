import {Component, OnInit} from '@angular/core';
import {User} from "../model/user";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {RegisterService} from "../service/register/register.service";
import {UserService} from "../service/user/user.service";
import {Router} from "@angular/router";
import {ToastService} from "../service/toast/toast.service";

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {


  users: User[] = [];
  userExistence = false;
  emailExistence = false;

  registerForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(6)]),
    password: new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(32)]),
    confirmPassword: new FormControl('', [Validators.minLength(6), Validators.required]),
    email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-z][A-Za-z0-9_\\.]{3,32}@[a-z0-9A-Z]{2,}(\\.[A-Za-z0-9]{2,4}){1,2}$')]),
    phone: new FormControl('', [Validators.required, Validators.pattern('^[0]\\d{9}$')])
  })


  constructor(private registerService: RegisterService,
              private userService: UserService,
              private router: Router,
              private toastService: ToastService) {
  }

  ngOnInit() {

  }

  register() {
    if (this.registerForm.valid) {
      this.userService.getAllUser().subscribe(users => {
        // @ts-ignore
        this.users = users;
        let emailExistence = false;
        for (let user of this.users) {
          if (user.username == this.registerForm.value.username) {
            this.userExistence = true;
            break;
          } else if (user.email == this.registerForm.value.email) {
            this.emailExistence = true;
            emailExistence = true;
            break;
          }
        }
        console.log(this.userExistence)
        console.log(emailExistence)
        if (!emailExistence && !this.userExistence) {
          console.log(emailExistence)
          this.registerService.createUser(this.registerForm.value).subscribe(() => {
            this.toastService.showMessage("Đăng ký tài khoản thành công", "is-success");
            this.router.navigateByUrl('/login')
          });
        }
      })
    } else {
      this.toastService.showMessage("Đăng ký thất bại", "is-warning");
    }
  }

  existence() {
    this.userExistence = false;
    this.emailExistence = false;
  }

  confirmPass(): boolean {
    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;
    if (password === confirmPassword) {
      return false;
    }
    return true;
  }
}
