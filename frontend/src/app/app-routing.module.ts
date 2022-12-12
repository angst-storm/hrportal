import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthComponent } from './auth/components/auth/auth.component';
import { ConfirmEmailComponent } from './auth/components/confirm-email/confirm-email.component';
import { RegistrationComponent } from './auth/components/registration/registration.component';
import { AuthGuard } from './Guards/auth-guard/auth.guard';
import { LoggedInGuard } from './Guards/logged-in-guard/logged-in.guard';
import { MainComponent } from './main/main.component';


const routes: Routes = [
  { path: '', component: MainComponent },
  { path: 'auth', component: AuthComponent, canActivate: [LoggedInGuard] },
  { path: 'register', component: RegistrationComponent, canActivate: [LoggedInGuard] },
  { path: 'confirm-email', component: ConfirmEmailComponent },
  { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule), canActivate: [AuthGuard] },
  { path: 'vacancies', loadChildren: () => import('./vacancies/vacancies.module').then(m => m.VacanciesModule), canActivate: [AuthGuard] },
  { path: 'resumes', loadChildren: () => import('./resume/resume.module').then(m => m.ResumeModule), canActivate: [AuthGuard] },
  { path: 'departments', loadChildren: () => import('./departments/departments.module').then(m => m.DepartmentsModule), canActivate: [AuthGuard] },
];

export const appRouting: ModuleWithProviders<RouterModule> = RouterModule.forRoot(routes);
