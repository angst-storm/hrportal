import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { catchError, map, Observable } from 'rxjs';
import { VacancyService } from './vacancy.service';
import { IVacancy } from '../interfaces';

@Injectable()
export class VacancyResolverService {

    constructor(
    private _vacancy: VacancyService,
    private _router: Router,
    ) { }

    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<string> {
        const vacancyId: string = route.paramMap.get('id') as string;

        return this._vacancy.getVacancyById(vacancyId)
            .pipe(
                map((data: IVacancy) => data.position),
                catchError(() => this._router.navigate(['cabinet/vacancies']))
            ) as Observable<string>;
    }
}
