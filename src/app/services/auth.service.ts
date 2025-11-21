import { HttpClient } from '@angular/common/http';
import { Injectable,inject,signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthResponse} from '../models/login-response';
import { tap } from 'rxjs';
import { User, UserProfile } from '../models/user';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userSignal = signal<User | null>(null);
  private httpClient=inject(HttpClient);

  constructor() {
    const localUser = localStorage.getItem('user');

    if (localUser) {
      const parsedUser = JSON.parse(localUser) as User;
      this.userSignal.set(parsedUser);
      this.persistUserMetadata(parsedUser);
    }
  }

  login(email: string, password: string) {
    return this.httpClient.post<AuthResponse>('login', {
      email: email,
      password: password
    }).pipe(tap(val => {
      try {
        const user = this.tokenParser(val.token);
        this.userSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token',val.token);
        this.persistUserMetadata(user);
      } catch (e) {
        console.log(e);
      }
    }))
  }

  logout(){
    localStorage.clear();
    
  }

  isLoggedIn():Boolean{
    if(localStorage.getItem('token')){
      return true;
    }else{
      return false
    }
  }

  private tokenParser(token: string): User {
    const decoded = jwtDecode<User>(token);
    return {
      user_id:decoded.user_id,
      email: decoded.email,
      role: decoded.role
    }
  }

 signup(username:string,email:string,phoneNumber:string,password:string){
  return this.httpClient.post<AuthResponse>('signup', {
    username:username,
    phone_number:phoneNumber,
      email: email,
      password: password
    }).pipe(tap(val => {
      try {
        const user = this.tokenParser(val.token);
        this.userSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token',val.token);
        this.persistUserMetadata(user);
      } catch (e) {
        console.log(e);
      }
    }))
 }
  getRole(): string | null {
    return this.userSignal()?.role ?? localStorage.getItem('role');
  }
  
  getID(): string | null {
    return this.userSignal()?.user_id ?? localStorage.getItem('user_id');
  }
  
  getUserByMailID(email: string) {
    return this.httpClient.get<UserProfile>(`users/email/${email}`);
  }

  private persistUserMetadata(user: User | null) {
    if (!user) {
      localStorage.removeItem('user_id');
      localStorage.removeItem('role');
      return;
    }

    if (user.user_id) {
      localStorage.setItem('user_id', user.user_id);
    }

    if (user.role) {
      localStorage.setItem('role', user.role);
    }
  }
}