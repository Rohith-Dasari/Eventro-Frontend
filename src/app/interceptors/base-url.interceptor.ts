import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export function BaseUrlInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const apiReq = req.clone({ url: `https://bmwgv9ngs2.execute-api.ap-south-1.amazonaws.com/v1/${req.url}` })
  return next(apiReq);
}

