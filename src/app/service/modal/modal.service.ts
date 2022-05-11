import {Injectable} from '@angular/core';
import {UserToken} from "../../model/user-token";
import {AuthenticateService} from "../authenticate.service";

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  currentUser: UserToken = {};
  isActived: boolean = false;

  constructor(private authenticationService:AuthenticateService) {
  }

  show() {
    this.isActived = true;
    this.currentUser = this.authenticationService.getCurrentUserValue();
  }

  close(){
    this.isActived = false
  }
}
