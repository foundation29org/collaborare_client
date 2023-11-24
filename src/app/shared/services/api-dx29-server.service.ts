import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, map} from 'rxjs/operators'
import { InsightsService } from 'app/shared/services/azureInsights.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiDx29ServerService {
    constructor(private http: HttpClient, public insightsService: InsightsService) {}

    getItems(orphacode){
      return this.http.get(environment.api+'/api/disease/'+orphacode).pipe(
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

    saveItems(_id, info){
      return this.http.put(environment.api+'/api/disease/'+_id, info).pipe(
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
