import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
// import {AuthGuard} from "../helper/auth.guard";
import {HomeComponent} from "./home/home.component";
import {BoardsComponent} from "./boards/boards.component";
import {BoardViewComponent} from "./board-view/board-view.component";
import {WorkspaceHomeComponent} from "./workspace/workspacehome/workspace-home.component";
import {WorkspaceMembersComponent} from "./workspace/workspacemembers/workspace-members.component";
import {WorkspaceSettingComponent} from "./workspace/workspace-setting/workspace-setting.component";

const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path:'boards',
    component:BoardsComponent
  },
  {
    path:'board/:id',
    component:BoardViewComponent
  },
  {
    path:'workspaces/:id/home',
    component:WorkspaceHomeComponent
  },
  {
    path:'workspaces/:id/members',
    component:WorkspaceMembersComponent
  },
  {
    path:'workspaces/:id/setting',
    component:WorkspaceSettingComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TrelloRoutingModule {
}
