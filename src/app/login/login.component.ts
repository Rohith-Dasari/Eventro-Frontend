import { Component, inject,DestroyRef } from '@angular/core';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';

@Component({
  selector: 'app-login',
  imports: [AuthLayoutComponent, FormsModule, RouterLink, CommonModule, InputTextModule, PasswordModule, ButtonModule, FloatLabelModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  email='';
  password='';
  loading = false;
  loginError = false;
  showPassword = false;
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private router = inject(Router)
  onLogin(){
    this.loading = true;
    this.loginError = false;

    const loginSubscription=this.authService.login(this.email,this.password).subscribe({
      next:()=>{
        this.loading = false;
        this.router.navigate(['dashboard','events'])
      },
      error: (err) => {
        console.error('Login failed:', err);
        this.loginError = true;
        this.loading = false;
        setTimeout(() => (this.loginError = false), 3000);
      }
    })
    
    this.destroyRef.onDestroy(()=>{
      loginSubscription.unsubscribe()
    })
  }

}
