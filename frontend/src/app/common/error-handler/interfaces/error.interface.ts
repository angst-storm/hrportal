// TODO ошибки форм должны рассосаться по форм-менеджерам
export interface IAccessError {
    detail: string[];
}

export interface IValidationError {
    desiredSalary?: string[];
    desiredEmployment?: string[];
    desiredSchedule?: string[];
    resume?: string[];
    isActive?: string[];
}

export interface IInputError {
    message: string;
}

export interface IAuthError {
    fullname?: IInputError | null;
    email?: IInputError | null;
    password?: IInputError | null;
    confirmPassword?: IInputError | null;
}

export interface IUserFormError {
    fullname?: IInputError | null;
    email?: IInputError | null;
    contact?: IInputError | null;
    department?: IInputError | null;
    experience?: IInputError | null;
}

export interface IUserUpdateError {
    email?: string[],
    expiriense?: string[],
    currentDepartmentId?: string[],
    existingSkillsIds?: string[],
}

export interface IResumeFormError {
    desiredPosition?: IInputError | null;
    desiredSalary?: IInputError | null;
    desiredSchedule?: IInputError | null;
    desiredEmployment?: IInputError | null;
}

export interface IVacancyFormError {
    position?: IInputError | null;
    department?: IInputError | null;
    salary?: IInputError | null;
    employment?: IInputError | null;
    schedule?: IInputError | null;
    description?: IInputError | null;
    requiredSkills?: IInputError | null;
}

export interface IDepartmentFormError {
    name?: IInputError | null;
    manager?: IInputError | null;
}

export interface ISubmitError {
    message: string;
}

export interface IRecoveryRequestError {
    email?: IInputError | null;
}

export interface IResetPasswordError {
    password?: IInputError | null;
    confirmPassword?: IInputError | null;
}
