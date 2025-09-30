import { Component } from '@angular/core';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [AuthLayoutComponent, FormsModule,RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})

export class SignupComponent {
  username='';
  email='';
  phoneNumber='';
  password='';
  confirmPassword=''


  onSignup(){

  }

}
