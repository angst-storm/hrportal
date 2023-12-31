import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import {
    DepartmentService, IDepartment,
    IDepartmentEditing,
    IDepartmentFormError, IDepartmentUpdate,
    IUser,
    UserService
} from '../../../../../../common';
import { contentExpansion, FormGenerator, FormManager, ISelectOption, Modal } from '../../../../../../lib';


@Component({
    selector: 'app-edit-department-modal',
    templateUrl: './edit-department-modal.component.html',
    styleUrls: ['./edit-department-modal.component.scss'],
    animations: [contentExpansion],
})
export class EditDepartmentModalComponent extends Modal implements OnInit {

    public departmentForm!: FormGroup;
    public department!: IDepartment;
    public users: ISelectOption[] = [];
    public submitError: string | undefined;

    public isSubmitted: boolean = false;
    public errors: IDepartmentFormError = {
        name: null,
        manager: null
    };
    public isUserEdited: IDepartmentEditing = {
        name: false,
        manager: false
    };
    public isDeleting: boolean = false;

    private _formManager: FormManager = FormManager.getInstance();

    constructor(
        private _form: FormGenerator,
        private _user: UserService,
        private _department: DepartmentService,
    ) {
        super();
    }

    public ngOnInit(): void {
        this._user.getUsers()
            .subscribe((users: IUser[]) => {
                const usersFiltered = users.filter((user: IUser) => !(user.isManager || user.isAdmin) || user.id === this.department.managerId);
                this.users = usersFiltered.map((user: IUser) => {
                    return {
                        id: user.id.toString(),
                        name: user.fullname
                    };
                });
            });
    }

    public onInjectInputs(inputs: any): void {
        this.department = inputs.department;
        this.departmentForm = this._form.getDepartmentForm(this.department);
    }

    public editDepartment(): void {
        const departmentUpdate: IDepartmentUpdate = this.createUpdateObject();

        this._department.editDepartment(departmentUpdate, this.department.id).subscribe({
            next: (department: IDepartment) => {
                this.department = department;
                this.isSubmitted = true;
            },
            error: (error: any) => {
                this.submitError = 'Ошибка изменения департамента';
            }
        });
    }

    public tagForDelete(): void {
        this.isDeleting = true;
        this.isSubmitted = true;
    }

    public deleteDepartment(): void {
        this._department.deleteDepartment(this.department.id).subscribe({
            next: () => {
                this.close();
            }
        });
    }

    public departmentNameChange(): void {
        this.errors.name = this._formManager.checkDepartmentName(this.departmentForm);
    }

    public checkChanges(): boolean {
        const form = this.departmentForm.value;
        this.isUserEdited.name = form.departmentName !== this.department.name;
        this.isUserEdited.manager = form.managerId.toString() !== this.department.managerId.toString();

        return this.isUserEdited.name || this.isUserEdited.manager;
    }

    public cancel(): void {
        this.close();
    }

    public cancelDelete(): void {
        this.isDeleting = false;
        this.isSubmitted = false;
    }

    private createUpdateObject(): IDepartmentUpdate {
        const form = this.departmentForm.value;
        const update: IDepartmentUpdate = {};
        if (this.isUserEdited.name) {
            update.name = form.departmentName;
        }
        if (this.isUserEdited.manager) {
            update.managerId = form.managerId;
        }

        return update;
    }

}
