import { Injectable } from '@angular/core';
import {AuthenticateService} from "../authenticate.service";
import {UserService} from "../user/user.service";
import {User} from "../../model/user";
import {NotificationService} from "../notification/notification.service";

@Injectable({
  providedIn: 'root'
})
export class NavbarService {
  loggedInUser!:User;

  constructor(private authenticationService: AuthenticateService,
              private userService: UserService,
              private notificationService: NotificationService) { }

  getCurrentUser(){
    if(this.authenticationService.getCurrentUserValue() !=null){
      let loggedInUserID = this.authenticationService.getCurrentUserValue().id;
      if(loggedInUserID!=null){
        this.userService.getUserById(loggedInUserID).subscribe(loginUser=>{
          this.loggedInUser = loginUser;
        });
        this.notificationService.findAllByUser(loggedInUserID).subscribe(notifications => {
          this.notificationService.notification = notifications
          for (let notification of notifications) {
            if (!notification.status) {
              this.notificationService.unreadNotice++;
            }
          }
        })
      }
    }
  }
}
