import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {LoginComponent} from './login/login.component';
import {SignUpComponent} from './sign-up/sign-up.component';
// import {RecoverPasswordComponent} from './recover-password/recover-password.component';
import {ReactiveFormsModule, FormGroup} from "@angular/forms";
import {HttpClientModule, HTTP_INTERCEPTORS} from "@angular/common/http";
import {AngularMaterialModule} from "./angular-material.module";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ErrorInterceptor} from "./helper/error.interceptor";
import {JwtInterceptor} from "./helper/jwt.interceptor";
import {FlexLayoutModule} from "@angular/flex-layout";
import {FormsModule} from "@angular/forms";
import {ShareModule} from "./share/share.module";
import {AngularFireStorageModule} from "@angular/fire/compat/storage";
import {AngularFireModule} from "@angular/fire/compat";
// import {AngularA}
import {environment} from "../environments/environment";


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignUpComponent,
    // RecoverPasswordComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AngularMaterialModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    ShareModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebaseConfig)
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

