import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
    FormGenerator,
    getEmploymentRussianAsArray,
    getScheduleRussianAsArray,
    ISelectOption
} from '../../../../../../../lib';
import {
    DepartmentService,
    IDepartment,
    ISkill,
    SkillsService,
    VacanciesSearchService
} from '../../../../../../../common';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';



@Component({
    selector: 'app-vacancy-filters',
    templateUrl: './vacancy-filters.component.html',
    styleUrls: ['./vacancy-filters.component.scss']
})
export class VacancyFiltersComponent {
    public filterForm: FormGroup = this._form.getFilterForm();
    @Output() public madeSearch: EventEmitter<null> = new EventEmitter<null>();

    @Input()
    public isConcreteDepartment: boolean = false;

    public schedule: ISelectOption[] = getScheduleRussianAsArray();
    public employment: ISelectOption[] = getEmploymentRussianAsArray();
    public departments$: Observable<IDepartment[]> = this._department.departments$;
    public skills$: Observable<ISkill[]> = this._skills.skills$;

    constructor(
        private _form: FormGenerator,
        private _department: DepartmentService,
        private _skills: SkillsService,
        private _vacancySearch: VacanciesSearchService,
    ) { }

    public applyFilters(): void {
        this.madeSearch.emit();
        this._vacancySearch.setFilters(this.filterForm.value);
    }

    public resetFilters(): void {
        this.filterForm = this._form.getFilterForm();
        this.madeSearch.emit();
        this._vacancySearch.setFilters(this.filterForm.value);
    }
}
