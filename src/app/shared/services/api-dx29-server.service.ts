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

    searchItems(item){
      return this.http.get(environment.api+'/api/searchdisease/'+item).pipe(
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

    selectDisease(orphacode){
      return this.http.get(environment.api+'/api/selectdisease/'+orphacode).pipe(
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


    getItems(userId){
      return this.http.get(environment.api+'/api/disease/'+userId).pipe(
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

    sendMsgValidator(userId, info){
      return this.http.post(environment.api+'/api/validator/'+userId, info).pipe(
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

    getProfile(userId){
      return this.http.get(environment.api+'/api/profile/'+userId).pipe(
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

    setProfile(userId, info){
      return this.http.put(environment.api+'/api/profile/'+userId, info).pipe(
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
