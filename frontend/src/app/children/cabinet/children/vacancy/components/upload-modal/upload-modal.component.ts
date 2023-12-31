import { Component } from '@angular/core';
import { UserService, VacancyService } from '../../../../../../common';
import { contentExpansion } from '../../../../../../lib';
import { Modal } from '../../../../../../lib/ui-modals/classes/modal';


@Component({
    selector: 'app-upload-modal',
    templateUrl: './upload-modal.component.html',
    styleUrls: ['./upload-modal.component.scss'],
    animations: [contentExpansion],
})
export class UploadModalComponent extends Modal {

    public vacancyName: string = '';
    public file: File | null = null;
    public isSubmitted: boolean = false;
    public submitTypeSelected: boolean = false;
    public resumeId: number | null = this._user.currentUserValue?.resumeId!;

    private _vacancyId: string = '';
    public uploadError: string | undefined;

    constructor(
        private _vacancy: VacancyService,
        private _user: UserService,
    ) {
        super();
    }

    public changeSubmitType(): void {
        this.submitTypeSelected = true;
    }

    public backToSelectType(): void {
        this.submitTypeSelected = false;
        this.file = null;
        this.uploadError = undefined;
    }

    public onInjectInputs(inputs: any): void {
        this._vacancyId = inputs.vacancyId;
        this.vacancyName = inputs.vacancyName;
    }

    public closeModal(): void {
        this.close();
    }

    public onFileChange(event: any): void {
        const file: File = event.target.files[0];
        this.checkFile(file);
        this.file = file;
    }

    public onFileDropped(files: FileList): void {
        this.checkFile(files.item(0)!);
        this.file= files.item(0);
    }

    public sendReadyResume(): void {
        this.isSubmitted = true;
        this._vacancy.responseToVacancyWithReadyResume(this._vacancyId, this.resumeId!);
    }

    public uploadFile(): void {
        this._vacancy.responseToVacancy(this._vacancyId, this.file!);
        this.isSubmitted = true;
    }

    public getUsername(): string {
        return this._user.getUserName();
    }

    public getUserEmail(): string {
        return this._user.currentUserValue?.email || '';
    }

    private checkFile(file: File): boolean {
        if (file.type !== 'application/pdf') {
            this.uploadError = 'Неверный формат файла';

            return false;
        }
        if (file.size > 4194304) {
            this.uploadError = 'Файл слишком большой';

            return false;
        }

        this.uploadError = undefined;

        return true;
    }

}
