import { Component } from '@angular/core';
import { AuthLayoutComponent } from '../shared/auth-layout/auth-layout.component';

@Component({
  selector: 'app-login',
  imports: [AuthLayoutComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email='';
  password='';
  constructor(private auth: AuthService, private router: Router){}
  onLogin(){
    this.auth.login(this.email,this.password);
    const role=this.auth.role();
    this.router.navigate([`/${role}/dashboard`])
  }

}
