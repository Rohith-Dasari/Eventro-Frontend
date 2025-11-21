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
  imports: [AuthLayoutComponent, FormsModule, RouterLink, CommonModule, InputTextModule, PasswordModule, ButtonModule],
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  }

  isValidPassword(password: string): boolean {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    return passwordRegex.test(password);
  }

  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    this.phoneNumber = value;
    event.target.value = value;
  }

  get usernameError(): string | null {
    if (!this.username.trim()) return 'Username cannot be blank';
    return null;
  }

  get emailError(): string | null {
    if (!this.email.trim()) return 'Email cannot be blank';
    if (!this.isValidEmail(this.email)) return 'Invalid email address';
    return null;
  }

  get phoneError(): string | null {
    if (!this.phoneNumber.trim()) return 'Phone number cannot be blank';
    if (!this.isValidPhone(this.phoneNumber)) return 'Phone number should be exactly 10 digits';
    return null;
  }

  get passwordError(): string | null {
    if (!this.password.trim()) return 'Password cannot be blank';
    if (!this.isValidPassword(this.password)) return 'Password should be at least 12 alphanumeric characters with at least one special character. Ex: MyPassword123!';
    return null;
  }

  get isFormValid(): boolean {
    return this.username.trim() !== '' && 
           this.isValidEmail(this.email) && 
           this.isValidPhone(this.phoneNumber) && 
           this.isValidPassword(this.password);
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
