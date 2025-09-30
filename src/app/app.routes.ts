import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

export const routes: Routes = [
    {
        path:'',
        component:LoginComponent
    },
    {
        path:'login',
        component:LoginComponent,
        canActivate:[]
    },
    {
        path:'signup',
        component:SignupComponent,
    }
    // {
    //     path:'admin/dashboard',
    //     component:,
    // },
    // {
    //     path:'customer/dashboard',
    //     component:,
    // }

];
