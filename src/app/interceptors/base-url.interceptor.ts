import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs";

export function BaseUrlInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const aws_url='https://eventro-api.rohith-dasari.me'
  const fast_api_url="http://127.0.0.1:8000"

  const apiReq = req.clone({ url: `${fast_api_url}/${req.url}` })
  console.log(apiReq)
  return next(apiReq);
}

