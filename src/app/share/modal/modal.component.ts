import { Component, OnInit } from '@angular/core';
import {ModalService} from "../../service/modal/modal.service";
import {Board} from "../../model/board";
import {ToastService} from "../../service/toast/toast.service";
import {BoardService} from "../../service/board/board.service";
import {UserService} from "../../service/user/user.service";
import {AuthenticateService} from "../../service/authenticate.service";

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  newBoard: Board = {
    title: '',
    owner: {
      id: -1,
    },
    columns: [],
    type:'',
  };
  constructor(public modalService:ModalService,
              private toastService:ToastService,
              private boardService:BoardService,
              private userService:UserService,
              private authenticateService:AuthenticateService) { }

  ngOnInit(): void {
  }
  createNewBoard() {
    this.modalService.close();
    this.newBoard.owner = this.modalService.currentUser;
    this.boardService.addBoard(this.newBoard).subscribe(()=>{
      this.toastService.showMessage("Board Created","is-success");
      this.resetInput();
    })
  }

  resetInput(){
    this.newBoard = {
      title: '',
      owner: {
        id: -1,
      },
      columns: [],
      type:''
    };
  }
}
