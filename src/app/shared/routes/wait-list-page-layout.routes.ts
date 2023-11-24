import { Routes } from '@angular/router';

//Route for content layout without sidebar, navbar and footer for pages like Login, Registration etc...

export const Wait_List_Pages_ROUTES: Routes = [
     {
        path: '',
        loadChildren: () => import('../../pages/wait-list/wait-list-page.module').then(m => m.WaitListPageModule)
    }
];
