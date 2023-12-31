import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IResume } from '../interfaces';
import { IResumeRequest } from '../interfaces/resume-request.interface';
import { IResumePage } from '../interfaces/resume-page.interface';

@Injectable({
    providedIn: 'root'
})
export class ResumeService {

    constructor(
        private _http: HttpClient,
    ) { }

    public getResumes(filters: IResumeRequest): Observable<IResumePage> {
        return this._http.get<IResumePage>(`${environment.apiURL}/resumes`, { params: { ...filters } });
    }

    public getResumeById(id: string): Observable<IResume> {
        return this._http.get<IResume>(`${environment.apiURL}/resumes/${id}`);
    }

    public responseToResume(id: number): void {
        this._http.post<{ detail: string}>(`${environment.apiURL}/resumes/${id}/response/`, {}, { params: { id } }).subscribe(
            { next: (response: { detail: string}) => {
                console.log(response.detail);
            }, error: () => {

            } }
        );
    }
}
