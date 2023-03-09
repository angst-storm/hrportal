import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateVacancyComponent, VacancyListComponent, VacancyDetailComponent } from './components';
import { VacancyResolverService } from '../../../../common';

const routes: Routes = [
    {
        path: '',
        component: VacancyListComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: null
        }
    },
    {
        path: 'create',
        component: CreateVacancyComponent,
        pathMatch: 'full',
        data: {
            breadcrumb: 'Создать вакансию'
        }
    },
    {
        path: ':id',
        component: VacancyDetailComponent,
        pathMatch: 'full',
        resolve: {
            breadcrumb: VacancyResolverService
        }
    },
];

export const vacancyRouting: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);
