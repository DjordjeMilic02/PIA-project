import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { RegistrationComponent } from './registration/registration.component';
import { AppComponent } from './app.component';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { ResetComponent } from './reset/reset.component';
import { DizajnerComponent } from './dizajner/dizajner.component';
import { VlasnikComponent } from './vlasnik/vlasnik.component';
import { CompanyDetailsComponent } from './company-details/company-details.component';

const routes: Routes = [
  { path: '', component: LandingPageComponent},
  { path: 'adminLogin', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'registration', component: RegistrationComponent},
  { path: 'reset', component: ResetComponent},
  { path: 'dizajner', component: DizajnerComponent},
  { path: 'vlasnik', component: VlasnikComponent},
  { path: 'company-details/:index', component: CompanyDetailsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
