import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import {AuthenticateService} from "../../../service/authenticate.service";
import {Workspace} from "../../../model/workspace";
import {UserToken} from "../../../model/user-token";
import {WorkspaceService} from "../../../service/workspace/workspace.service";
import {Board} from "../../../model/board";

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css']
})
export class SideBarComponent implements OnInit {
  workspaces: Workspace[] = [];
  @Output() workspacesPublic = new EventEmitter<Workspace[]>();
  loggedInUser!: UserToken;

  constructor(private authenticateService: AuthenticateService) {
  }


  ngOnInit(): void {
    this.loggedInUser = this.authenticateService.getCurrentUserValue()
  }

  getWorkspaces(event: Workspace[]) {
    this.workspaces = event;
  }

  getWorkspacePubic(event : Workspace[]) {
    this.workspacesPublic.emit(event);
  }

  showCreateWorkspaceModal() {
    document.getElementById('create-workspace')!.classList.add('is-active');
  }

  showWorkspaceButton(index:any){
    let toChange = document.getElementById(`workspace-${index}`);
    let arrowDown = document.getElementById(`arrow-down-${index}`);
    let arrowUp = document.getElementById(`arrow-up-${index}`);
    if(toChange!.classList.contains('is-hidden')){
      toChange!.classList.remove('is-hidden')
      arrowDown!.classList.add('is-hidden')
      arrowUp!.classList.remove('is-hidden')
    } else {
      toChange!.classList.add('is-hidden')
      arrowDown!.classList.remove('is-hidden')
      arrowUp!.classList.add('is-hidden')
    }
  }
}
