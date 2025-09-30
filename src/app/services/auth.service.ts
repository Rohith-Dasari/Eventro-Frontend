import { HttpClient } from '@angular/common/http';
import { Injectable,inject,signal } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/login-response';
import { tap } from 'rxjs';
import { User } from '../models/user';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  userSignal = signal<User | null>(null)
  private httpClient=inject(HttpClient)
  private router=inject(Router)

  constructor() {
    const localUser = localStorage.getItem('user')

    if (localUser) {
      this.userSignal.set(JSON.parse(localUser) as User)
    }
  }

  login(email: string, password: string) {
    // console.log('hit')
    return this.httpClient.post<LoginResponse>('login', {
      email: email,
      password: password
    }).pipe(tap(val => {
      try {
        const user = this.tokenParser(val.token)
        this.userSignal.set(user)
        localStorage.setItem('role', JSON.stringify(user.role))
        localStorage.setItem('email', JSON.stringify(user.email))
        localStorage.setItem('user_id', JSON.stringify(user.user_id))
        localStorage.setItem('token',val.token)
        // console.log('hit3')
      } catch (e) {
        console.log(e)
      }
    }))
  }

  private tokenParser(token: string): User {
    const decoded = jwtDecode<User>(token)
    return {
      user_id:decoded.user_id,
      email: decoded.email,
      role: decoded.role
    }
  }


  logoutUser(){
    localStorage.clear();
  }

  isLoggedIn():boolean{
    return !!localStorage.getItem('token');
  }

  getRole(): string|null{
    if (this.userSignal()){
      return (this.userSignal()as User).role
    }
    else return null    
  }
}
