import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import {
    DepartmentService, IDepartment, ISkill,
    ISubmitError, IUser,
    IUserEditing,
    IUserFormError,
    IUserUpdate, SkillsService,
    UserService
} from '../../../../../../common';
import {
    contentExpansion,
    FormGenerator,
    FormManager,
    getExperienceRussianAsArray,
    ISelectOption
} from '../../../../../../lib';
import { ActivityState } from '../../../../../../common/cabinet/grade/enums/activity-state.enum';
import { ActivityService } from '../../../../../../common/cabinet/grade/services/activity.service';
import { GradeModel } from '../../../../../../common/cabinet/grade/models/grade.model';
import { GradeService } from '../../../../../../common/cabinet/grade/services/grade-service';
import { GradeRequestService } from '../../../../../../common/cabinet/grade/services/grade-request.service';


@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
    animations: [contentExpansion],
    providers: [
        GradeService,
        GradeRequestService,
    ]
})
export class ProfileComponent implements OnInit, OnDestroy {

    public user$: BehaviorSubject<IUser | null> = this._user.currentUserSubject$;
    public user: IUser | null = null;
    public experience: ISelectOption[] = getExperienceRussianAsArray();
    public formManager: FormManager = FormManager.getInstance();
    public departments: Observable<IDepartment[]> = this._department.departments$;
    public skills$: Observable<ISkill[]> = this._skills.skills$;
    public userForm!: FormGroup;
    public uploadedPhoto: File | null = null;
    public uploadedPhotoUrl: string | ArrayBuffer | null = null;
    public errors: IUserFormError = {
        fullname: null,
        email: null,
        contact: null,
        department: null,
        experience: null
    };

    public submitError: ISubmitError | null = null;

    public isEditing: boolean = false;
    public isAddingSkill: boolean = false;
    public isUserEdited: IUserEditing = {
        name: false,
        photo: false,
        email: false,
        contact: false,
        experience: false,
        department: false,
        skills: false
    };
    public isSavedChanges: boolean = false;

    public inactiveGrades: GradeModel[] = [];
    public activeGrade?: GradeModel;
    public grades?: GradeModel[];

    private _destroy$: Subject<boolean> = new Subject<boolean>();

    constructor(
        private _department: DepartmentService,
        private _user: UserService,
        private _form: FormGenerator,
        private _skills: SkillsService,
        private _grade: GradeService,
    ) { }

    public ngOnInit(): void {
        this._user.currentUser$
            .pipe(
                takeUntil(this._destroy$)
            )
            .subscribe((user: IUser | null) => {
                this.user = user;
                if (user) {
                    this.resetForm();
                    this.getGrades(user.id);
                }
            });
    }

    public getGrades(userId: number): void {
        this._grade.getUserGrades(userId)
            .subscribe({
                next: (grades: GradeModel[]) => {
                    this.inactiveGrades = grades.filter(g => !g.inWork).reverse();
                    this.activeGrade = grades.find(g => g.inWork);
                    this.grades = grades;
                }
            });
    }

    public ngOnDestroy(): void {
        this._destroy$.next(true);
        this._destroy$.complete();
    }

    public onPhotoChange(event: any): void {
        const file: File = event.target.files[0];
        if (file.size > 2.4 * 1024 * 1024) {
            return;
        }

        const mimeType = file.type;
        if (mimeType.match(/.(jpe?g?|png|gif)$/) == null) {
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (_event) => {
            this.uploadedPhotoUrl = reader.result;
            this.uploadedPhoto = file;
            this.isUserEdited.photo = true;
        };
    }

    public saveUser(): void {
        const isEdited: boolean = this.checkFormChanges(); // Пока не знаю, надо ли это
        const hasErrors = this.checkAll();
        if (hasErrors) {
            return;
        }
        const userUpdate = this.createUserUpdateObject();
        this._user.updateUserInfo(userUpdate)
            .subscribe({
                next: (user: IUser) => {
                    this._user.updateCurrentUser(user);
                    this.isSavedChanges = true;
                    this.cancelEditing();
                },
                error: () => {
                    this.submitError = { message: 'Произошла непредвиденная ошибка' };
                }
            });
    }

    public editProfile(): void {
        this.isEditing = true;
        this.isSavedChanges = false;
        this.userForm.enable();
    }

    public cancelEditing(): void {
        this.resetForm();
        this.uploadedPhoto = null;
        this.uploadedPhotoUrl = null;
        this.isEditing = false;
        this.isAddingSkill = false;
        this.isUserEdited = { name: false, photo: false, email: false, contact: false, experience: false, department: false, skills: false };
        this.errors = { fullname: null, email: null, contact: null, department: null, experience: null };
        this.submitError = null;
    }

    public deleteSkill(skill: ISkill): void {
        this.userForm.controls['skills'].setValue(this.userForm.controls['skills'].value.filter((s: ISkill) => s.id !== skill.id));
    }

    public deletePhoto(): void {
        this.uploadedPhoto = null;
        this.uploadedPhotoUrl = null;
        this.isUserEdited.photo = true;
    }

    public addedSkill(skill: ISkill): void {
        this.userForm.controls['skills'].value.push(skill);
    }

    public fullnameChange(): void {
        this.errors.fullname = this.formManager.checkFullname(this.userForm);
    }

    public emailChange(): void {
        this.errors.email = this.formManager.checkEmail(this.userForm);
    }

    public contactChange(): void {
        this.errors.contact = this.formManager.checkContact(this.userForm);
    }

    public departmentChange(): void {
        this.errors.department = this.formManager.checkDepartment(this.userForm);
    }

    public experienceChange(): void {
        this.errors.experience = this.formManager.checkExperience(this.userForm);
    }

    public checkFormChanges(): boolean {
        const form = this.userForm.value;
        const user: IUser = this.user as IUser;
        if (user) {
            this.isUserEdited.name = form.fullname !== user.fullname;
            this.isUserEdited.email = form.email !== user.email;
            this.isUserEdited.contact = form.contact !== user.contact;
            this.isUserEdited.experience = (form.experience ? form.experience.id : null) !== user.experience;
            this.isUserEdited.department = (form.department ? form.department.id : null) !== (user.currentDepartment ? user.currentDepartment!.id : null);
            form.skills.forEach((skill: ISkill) => {
                if (!user.existingSkills.some((s: ISkill) =>s.id === skill.id)) {
                    // Если в форме есть скилл, которого нет в юзере
                    //console.log('check passed added new');
                    this.isUserEdited.skills = true;

                    return;
                }
            });
            let sameSkillCounter: number = 0;
            user.existingSkills.forEach((skill: ISkill) => {
                if (!form.skills.some((s: ISkill) =>s.id === skill.id)) {
                    // Если в форме нет скилла, который есть в юзере
                    //console.log('check passed deleted existing');
                    this.isUserEdited.skills = true;

                    return;
                } else {
                    sameSkillCounter++;
                }
            });
            // Если в форме и в юзере разное количество скиллов
            //console.log('check passed different length');
            this.isUserEdited.skills = user.existingSkills.length !== form.skills.length;

            // если нету добавленных и удаленных скиллов и количество скиллов в форме и в юзере одинаковое
            //console.log('check passed same length');
            this.isUserEdited.skills = !((sameSkillCounter === form.skills.length) && (sameSkillCounter === user.existingSkills.length));

        }

        // Проверка на изменения в форме
        // console.log(this.isUserEdited);
        // console.log(this.userForm);
        // console.log(user);

        return this.isUserEdited.name
            || this.isUserEdited.photo
            || this.isUserEdited.email
            || this.isUserEdited.contact
            || this.isUserEdited.experience
            || this.isUserEdited.department
            || this.isUserEdited.skills;
    }


    private resetForm(): void {
        this.userForm = this._form.getUserDataForm(this.user!, this.experience);
        this.userForm.disable();
    }

    private checkAll(): boolean {
        this.fullnameChange();
        this.emailChange();
        this.contactChange();
        this.departmentChange();
        this.experienceChange();

        if (this.errors.fullname || this.errors.email || this.errors.contact || this.errors.department || this.errors.experience) {
            return true;
        }

        return false;
    }

    private createUserUpdateObject(): IUserUpdate  {
        const form = this.userForm.value;
        const userUpdate: IUserUpdate = {};
        if (this.isUserEdited.name) {
            userUpdate.fullname = form.fullname;
        }
        if (this.isUserEdited.photo) {
            userUpdate.photo = this.uploadedPhoto!;
        }
        if (this.isUserEdited.email) {
            userUpdate.email = form.email;
        }
        if (this.isUserEdited.contact) {
            userUpdate.contact = form.contact;
        }
        if (this.isUserEdited.experience) {
            userUpdate.experience = form.experience.id;
        }
        if (this.isUserEdited.department) {
            userUpdate.currentDepartmentId = form.department ? form.department.id : null;
        }
        userUpdate.existingSkillsIds = (form.skills as ISkill[]).map((skill: ISkill) => skill.id);

        return userUpdate;
    }

    protected readonly ActivityState = ActivityState;
}
