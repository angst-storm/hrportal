import { IDepartment, IUser } from '../../../../../../../common';
import { Inject, Injectable, Optional } from '@angular/core';
import { IEmployeeRequestParams } from '../data/param-interfaces/employee-request-params.interface';
import { IPage, PageLazyLoadingService } from '../../../../../../../lib';
import { Observable, Subject, switchMap } from 'rxjs';
import { EmployeeService } from './employee.service';
import { USER_DEPARTMENT_TOKEN } from '../../../tokens/user-department.token';

@Injectable()
export class EmployeePageLazyLoadingService extends PageLazyLoadingService<IUser, IEmployeeRequestParams> {
    constructor(
        private _employeeService: EmployeeService,
        @Inject(USER_DEPARTMENT_TOKEN) @Optional() private _department$: Subject<IDepartment>
    ) {
        super();
    }

    protected override receiveData(params?: IEmployeeRequestParams): Observable<IPage<IUser>> {
        return this._department$
            ? this._department$
                .pipe(
                    switchMap((department: IDepartment) => {
                        if (params) {
                            params.department = [department.id];
                        } else {
                            params = {
                                limit: 3,
                                offset: 0,
                                department: [department.id],
                                active: true,
                            };
                        }

                        return this._employeeService.getEmployeePages(params);
                    })
                )
            : this._employeeService.getEmployeePages({
                ...params,
                limit: 3,
                offset: 0,
            });
    }
}
