import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from 'environments/environment';
import { InsightsService } from 'app/shared/services/azureInsights.service';
import { catchError, map } from 'rxjs/operators'

@Injectable()
export class OpenAiService {
    constructor(private http: HttpClient, public insightsService: InsightsService) {}

    postOpenAi(info){
      return this.http.post(environment.api + '/api/callopenaicontext', info).pipe(
        map((res: any) => {
          return res;
        }),
        catchError((err) => {
          console.log(err);
          this.insightsService.trackException(err);
          return err;
        })
      );
    }

}
