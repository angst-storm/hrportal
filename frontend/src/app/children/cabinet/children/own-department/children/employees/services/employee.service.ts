import { Injectable } from '@angular/core';
import { EmployeeRequestService } from '../data/services/employee-request.service';
import { map, Observable } from 'rxjs';
import { employeeMapper, IEmployeeResponse } from '../data/response-interfaces/employee-response.interface';
import { IUser } from '../../../../../../../common';
import { IEmployeeRequestParams } from '../data/param-interfaces/employee-request-params.interface';
import { IPage, pageMapper } from '../../../../../../../lib';

@Injectable()
export class EmployeeService {
    constructor(private _employeeRequestService: EmployeeRequestService) {

    }

    public deleteEmployee(id: number): Observable<void> {
        return this._employeeRequestService.deleteEmployee(id.toString());
    }

    public getEmployeeList(queryParams?: IEmployeeRequestParams): Observable<IUser[]> {
        return this._employeeRequestService.getEmployeeList(queryParams ?? {})
            .pipe(
                map((data: IEmployeeResponse[]) => {
                    return data.map(employeeMapper);
                })
            );
    }

    public getEmployeePages(queryParams?: IEmployeeRequestParams): Observable<IPage<IUser>> {
        return this._employeeRequestService.getEmployeePage(queryParams ?? {})
            .pipe(
                map((data: IPage<IEmployeeResponse>) => {
                    return pageMapper(data, employeeMapper);
                })
            );
    }

    public getEmployeeById(id: number): Observable<IUser> {
        return this._employeeRequestService.getEmployeeById(id)
            .pipe(
                map((data: IEmployeeResponse) => {
                    return employeeMapper(data);
                })
            );
    }
}
