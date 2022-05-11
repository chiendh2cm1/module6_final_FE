import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {TrelloRoutingModule} from './trello-routing.module';
import {HomeComponent} from './home/home.component';
import {ShareModule} from "../share/share.module";
import {BoardsComponent} from './boards/boards.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DragDropModule} from "@angular/cdk/drag-drop";
import { BoardViewComponent } from './board-view/board-view.component';
import { WorkspaceHomeComponent } from './workspace/workspacehome/workspace-home.component';
import { WorkspaceMembersComponent } from './workspace/workspacemembers/workspace-members.component';
import {AngularMaterialModule} from "../angular-material.module";
import {NgxPaginationModule} from "ngx-pagination";
import { WorkspaceSettingComponent } from './workspace/workspace-setting/workspace-setting.component';


@NgModule({
  declarations: [
    HomeComponent,
    BoardsComponent,
    BoardViewComponent,
    WorkspaceHomeComponent,
    WorkspaceMembersComponent,
    WorkspaceSettingComponent,
  ],
  imports: [
    CommonModule,
    TrelloRoutingModule,
    ShareModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    AngularMaterialModule,
    NgxPaginationModule
  ]
})
export class TrelloModule {
}
