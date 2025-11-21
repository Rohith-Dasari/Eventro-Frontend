import { HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptor, HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
    const token = localStorage.getItem('token');
    if(token){
        const newReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log(newReq)
        return next(newReq);
    }
    console.log(req)
    return next(req);
}