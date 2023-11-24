import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, map} from 'rxjs/operators'
import { InsightsService } from 'app/shared/services/azureInsights.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiDx29ServerService {
    constructor(private http: HttpClient, public insightsService: InsightsService) {}

    searchDiseases(info) {
      return this.http.post('https://dx29.ai/api/gateway/search/disease/', info).pipe(
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

    updateItems(_id, info){
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

    saveItems(_id, info){
      return this.http.post(environment.api+'/api/disease/'+_id, info).pipe(
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

    deleteDisease(_id, info){
      return this.http.post(environment.api+'/api/deletedisease/'+_id, info).pipe(
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
