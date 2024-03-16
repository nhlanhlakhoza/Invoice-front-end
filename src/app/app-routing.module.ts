import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent} from './dashboard/dashboard.component';
import { CreateComponent } from './create/create.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './profile/profile.component';
import { QuotationsComponent } from './quotations/quotations.component';
import { Invoices4Component } from './invoices4/invoices4.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ForgotComponent } from './forgot/forgot.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { Home1Component } from './home1/home1.component';
import { UserComponent } from './user/user.component';
import { PasswordChangeSettingComponent } from './password-change-setting/password-change-setting.component';
import { QuoteListComponent } from './quote-list/quote-list.component';



const routes: Routes = [

  {path: '', component:Home1Component},
  {path: 'home', component:HomeComponent},
  {path: 'login', component:LoginComponent},
  {path: 'register', component:RegisterComponent},
  {path: 'dashboard', component:DashboardComponent},
  {path: 'create', component:CreateComponent},
  {path: 'settings', component:SettingsComponent},
  {path: 'profile', component:ProfileComponent},
  {path: 'quotations', component:QuotationsComponent},
  {path: 'invoices', component:Invoices4Component},
  {path: 'notifications', component:NotificationsComponent},
  {path: 'forgot_password', component:ForgotComponent},
  {path: 'change_password', component:ChangePasswordComponent},
  {path :'user',component:UserComponent},
  {path:'changePasswordSetting',component:PasswordChangeSettingComponent},
  {path :'quate',component:QuoteListComponent},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
