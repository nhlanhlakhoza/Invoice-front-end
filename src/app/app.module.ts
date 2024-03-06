import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { CreateComponent } from './create/create.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { Invoices4Component } from './invoices4/invoices4.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ForgotComponent } from './forgot/forgot.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { Home1Component } from './home1/home1.component';
import { HttpClientModule } from '@angular/common/http';
import { UserComponent } from './user/user.component';
import { PasswordChangeSettingComponent } from './password-change-setting/password-change-setting.component';
import { QuoteListComponent } from './quote-list/quote-list.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    DashboardComponent,
    SettingsComponent,
    CreateComponent,
    ProfileComponent,
    QuotationsComponent,
    Invoices4Component,
    NotificationsComponent,
    ForgotComponent,
    ChangePasswordComponent,
    Home1Component,
    UserComponent,
    PasswordChangeSettingComponent,
    QuoteListComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    PdfViewerModule
    
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
