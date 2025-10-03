import { Component, DestroyRef, inject } from '@angular/core';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-signup',
  imports: [AuthLayoutComponent,FormsModule, CommonModule, InputTextModule, PasswordModule, ButtonModule],
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

  // Validation methods
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  isValidPassword(password: string): boolean {
    // At least 12 characters, alphanumeric with at least one special character
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
  }

  // Input formatting for phone number
  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 10) {
      value = value.slice(0, 10); // Limit to 10 digits
    }
    this.phoneNumber = value;
    event.target.value = value;
  }


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
