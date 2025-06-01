import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home.component';
import { AssistanceRequestPageComponent } from './pages/assistance-request/assistance-request.component';
import { NotFoundPageComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
    { path: '', component: HomePageComponent, pathMatch: 'full' },
    { path: 'assistance', component: AssistanceRequestPageComponent },
    { path: '**', component: NotFoundPageComponent }
];
