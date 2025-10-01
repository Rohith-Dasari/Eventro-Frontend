import { inject, Injectable } from "@angular/core";
import { CanActivate, CanActivateChild, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({
    providedIn: 'root'
})

export class AuthGuard implements CanActivate, CanActivateChild {
    private auth=inject(AuthService)
    private router=inject(Router)

    canActivate(): boolean | UrlTree {
        return this.checkLogin();
    }

    canActivateChild(): boolean | UrlTree {
        return this.checkLogin();
    }

    private checkLogin(): boolean | UrlTree {
        if (this.auth.isLoggedIn()){
            return true;
        }
        return this.router.parseUrl('/login');
    }
}