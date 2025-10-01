import { Component, DestroyRef, inject } from '@angular/core';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  imports: [AuthLayoutComponent, FormsModule,RouterLink,CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent {
  username='';
  email='';
  phoneNumber='';
  password='';

  loading=false;
  signupError:string|null=null;

  private authService=inject(AuthService);
  private router=inject(Router);
  private destroyRef=inject(DestroyRef);


  onSignup(){
    this.loading=true;
    this.signupError=null;

    const signupSub=this.authService.signup(this.username,this.email,this.phoneNumber,this.password)
    .subscribe({
      next:()=>{
        this.router.navigate(['dashboard','events'])
      },
      error: (err) => {
          this.signupError = err?.error?.message || 'Signup failed';
          this.loading = false;
          setTimeout(() => (this.loading = false), 2000);
      }
    })
    
    this.destroyRef.onDestroy(()=>{
      signupSub.unsubscribe()
    })

  }

}
