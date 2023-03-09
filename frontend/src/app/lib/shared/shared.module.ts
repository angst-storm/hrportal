import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
    AccordionComponent,
    ErrorComponent,
    SearchSelectFormComponent, SelectComponent,
    SelectSmallComponent, SelectWithRadioComponent,
    SelectWithRadioMultipleComponent, SelectWithRadioMultipleSearchComponent,
    SelectWithSearchComponent
} from './components';
import {
    AccordionContentDirective,
    AccordionItemDirective,
    ClickOutsideDirective,
    DragAndDropDirective,
    LimitInputDirective
} from './directives';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxMaskModule } from 'ngx-mask';
import { EmploymentPipe, SchedulePipe } from '../utils';
import { ReactiveFormsModule } from '@angular/forms';
import { HoverListenerDirective } from './directives/hover-listener.directive';
import { AccordionArrowIconComponent } from "../../../assets/img/accordion-arrow/accordion-arrow-icon";
import { CheckCircleIconComponent } from "../../../assets/img/check-circle/check-circle-icon";
import { CheckCircleEmptyIconComponent } from "../../../assets/img/check-circle-empty/check-circle-empty-icon";
import { CheckSquareIconComponent } from "../../../assets/img/check-square/check-square-icon";
import { CheckSquareEmptyComponent } from "../../../assets/img/check-square-empty/check-square-empty-icon";
import { MagnifierIconComponent } from "../../../assets/img/magnifier/magnifier-icon";
import { Cross1IconComponent } from "../../../assets/img/cross1/cross1-icon";

const exportingComponents: any[] = [
    SchedulePipe,
    EmploymentPipe,
    ClickOutsideDirective,
    ErrorComponent,
    SelectComponent,
    SelectWithSearchComponent,
    DragAndDropDirective,
    SelectSmallComponent,
    SearchSelectFormComponent,
    SelectWithRadioComponent,
    SelectWithRadioMultipleComponent,
    AccordionComponent,
    AccordionContentDirective,
    AccordionItemDirective,
    SelectWithRadioMultipleSearchComponent,
    LimitInputDirective,
    HoverListenerDirective,
];

@NgModule({
    declarations: [
        ...exportingComponents
    ],
    exports: exportingComponents,
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        ScrollingModule,
        NgxMaskModule.forChild(),
        AccordionArrowIconComponent,
        CheckCircleIconComponent,
        CheckCircleEmptyIconComponent,
        CheckSquareIconComponent,
        CheckSquareEmptyComponent,
        MagnifierIconComponent,
        Cross1IconComponent
    ]
})
export class SharedModule { }
