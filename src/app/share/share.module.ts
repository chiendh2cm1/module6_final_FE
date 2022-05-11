import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarBoardHeaderComponent } from './navbar-board-header/navbar-board-header.component';
import { ModalComponent } from './modal/modal.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";
import { SideBarComponent } from './side-bar/side-bar/side-bar.component';
import {NavbarComponent} from "./navbar/navbar.component";
import {MatListModule} from "@angular/material/list";
import { FooterComponent } from './footer/footer.component';
import {AngularMaterialModule} from "../angular-material.module";
import {NgxPaginationModule} from "ngx-pagination";

@NgModule({
  declarations: [
    NavbarComponent,
    NavbarBoardHeaderComponent,
    ModalComponent,
    SideBarComponent,
    FooterComponent
  ],
    exports: [
        NavbarComponent,
        NavbarBoardHeaderComponent,
        ModalComponent,
        SideBarComponent,
        FooterComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule,
        MatListModule,
        AngularMaterialModule,
        ReactiveFormsModule,
        NgxPaginationModule
    ]
})
export class ShareModule { }
