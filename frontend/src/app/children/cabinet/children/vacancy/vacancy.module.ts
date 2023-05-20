import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxStickySidebarModule } from '@smip/ngx-sticky-sidebar';
import { NgxMaskModule } from 'ngx-mask';
import {
    CreateVacancyComponent, FiltersComponent,
    SearchComponent,
    UploadModalComponent, VacancyListComponent,
    VacancyComponent,
    VacancyDetailComponent
} from './components';
import { vacancyRouting } from './vacancy-routing.module';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SharedModule } from '../../../../lib/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { VacanciesSearchService, VacancyDeclinationPipe, VacancyResolverService } from '../../../../common';
import { PlusIconComponent, Cross2IconComponent, MagnifierIconComponent, Cross1IconComponent, FilterIconComponent, CrossIconComponent, UploadIconComponent, SuccessIconComponent, EditIconComponent, ArchiveIconComponent, UpArrowIconComponent } from '../../../../../assets/img';


@NgModule({
    declarations: [
        VacancyListComponent,
        VacancyComponent,
        VacancyDetailComponent,
        UploadModalComponent,
        CreateVacancyComponent,
        SearchComponent,
        FiltersComponent,
        VacancyDeclinationPipe,
    ],
    exports: [
        VacancyListComponent
    ],
    providers: [
        VacanciesSearchService,
        VacancyResolverService
    ],
    imports: [
        CommonModule,
        vacancyRouting,
        SharedModule,
        ReactiveFormsModule,
        NgxMaskModule.forChild(),
        EditorModule,
        NgxStickySidebarModule.withConfig({
            minWidth: '280px',
        }),
        PlusIconComponent,
        Cross2IconComponent,
        MagnifierIconComponent,
        Cross1IconComponent,
        FilterIconComponent,
        CrossIconComponent,
        UploadIconComponent,
        SuccessIconComponent,
        EditIconComponent,
        ArchiveIconComponent,
        UpArrowIconComponent
    ]
})
export class VacancyModule { }
