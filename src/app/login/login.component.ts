import { Component, inject,DestroyRef } from '@angular/core';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [AuthLayoutComponent, FormsModule,RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  email='';
  password='';
  private authService = inject(AuthService)
  private destroyRef = inject(DestroyRef)
  private router = inject(Router)
  onLogin(){

    const loginSubscription=this.authService.login(this.email,this.password).subscribe({
      next:()=>{
        this.router.navigate([this.authService.userSignal()?.role,'dashboard'])
      },
    })

    this.destroyRef.onDestroy(()=>{
      loginSubscription.unsubscribe()
    })
  }

}
