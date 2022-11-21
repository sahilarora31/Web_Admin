import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ProgramListingComponent } from '@programs/program-listing/program-listing.component';
import { ProgramDetailComponent } from '@programs/program-detail/program-detail.component';
import { APP_BASE_HREF } from '@angular/common';
import { MsMaterialModule } from './ms-material.module';
import { CreateProgramModalComponent } from '@programs/create-program-modal/create-program-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProgramCardComponent } from '@programs/shared/component/program-card/program-card.component';
import { ProgramTabsComponent } from '@programs/shared/component/program-tabs/program-tabs.component';
import { SearchTitlesResultComponent } from '@shared/components/search-titles-result/search-titles-result.component';
import { SearchTitleComponent } from '@shared/components/search-title/search-title.component';
import { TitleCardComponent } from '@shared/components/title-card/title-card.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { LoaderComponent } from '@shared/components/loader/loader.component';
import { SpinnerService } from '@shared/services/spinner.service';
import { SearchService } from '@shared/services/search.service';
import { EngageService } from '@shared/services/engage.service';
import { ToastMessageComponent } from '@shared/components/toast-message/toast-message.component';
import { TitleCardCarouselComponent } from '@shared/components/title-card-carousel/title-card-carousel.component';
import { TitleInfoCardComponent } from '@shared/components/title-info-card/title-info-card.component';
import { CarouselBreakPointService } from '@shared/services/carousel-break-point.service';
import { CarouselModule } from 'primeng/carousel';
import { ProgramCardImagesComponent } from '@programs/shared/component/program-card-images/program-card-images.component';
import { ProgramCardBlockComponent } from '@programs/shared/component/program-card-block/program-card-block.component';
import { MyProgramListComponent } from '@programs/program-listing/my-program-list/my-program-list.component';
import { ActiveProgramListComponent } from '@programs/program-listing/active-program-list/active-program-list.component';
import { DraftProgramListComponent } from '@programs/program-listing/draft-program-list/draft-program-list.component';
import { ClosedProgramListComponent } from '@programs/program-listing/closed-program-list/closed-program-list.component';
import { CreateProgramComponent } from '@programs/program-listing/create-program/create-program.component';
import { TitlePreviewComponent } from '@shared/components/title-preview/title-preview.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MainComponent } from './core/main/main.component';
import { ConfigService } from '@shared/services/config.service';
import { UserService } from '@shared/services/user.service';
import { TitleAvailabilityComponent } from '@shared/components/title-availability/title-availability.component';
import { SortAndFilterComponent } from '@shared/components/sort-and-filter/sort-and-filter.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { NoProgramComponent } from '@programs/shared/component/no-program/no-program.component';
import { MatDialogRef } from '@angular/material/dialog';
import { PartnerManagementComponent } from './core/partner-management/partner-management.component';
import { AgGridModule } from 'ag-grid-angular';
import { ActionButtonComponent } from './core/partner-management/shared/component/action-button/action-button.component';
import { CreatePartnerManagementComponent } from './core/partner-management/create-partner-management/create-partner-management.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { EditPartnerManagementComponent } from './core/partner-management/edit-partner-management/edit-partner-management.component';
import { LocationPopupComponent } from './core/partner-management/shared/component/location-popup/location-popup.component';
import { DeletePopupComponent } from './core/partner-management/shared/component/delete-popup/delete-popup.component';
import { QRCodeModule } from 'angularx-qrcode';

@NgModule({
  declarations: [
    AppComponent,
    ProgramListingComponent,
    ProgramDetailComponent,
    CreateProgramModalComponent,
    ProgramTabsComponent,
    ProgramCardComponent,
    SearchTitlesResultComponent,
    SearchTitleComponent,
    TitleCardComponent,
    LoaderComponent,
    ToastMessageComponent,
    TitleCardCarouselComponent,
    ProgramCardBlockComponent,
    LoaderComponent,
    ProgramCardImagesComponent,
    TitleInfoCardComponent,
    MyProgramListComponent,
    ActiveProgramListComponent,
    DraftProgramListComponent,
    ClosedProgramListComponent,
    CreateProgramComponent,
    TitlePreviewComponent,
    MainComponent,
    TitleAvailabilityComponent,
    SortAndFilterComponent,
    NoProgramComponent,
    PartnerManagementComponent,
    CreatePartnerManagementComponent,
    EditPartnerManagementComponent,
    ActionButtonComponent,
    LocationPopupComponent,
    DeletePopupComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MsMaterialModule,
    BrowserAnimationsModule,
    HttpClientModule,
    CarouselModule,
    DragDropModule,
    RadioButtonModule,
    AgGridModule.withComponents([PartnerManagementComponent,CreatePartnerManagementComponent, EditPartnerManagementComponent, ActionButtonComponent]),
    MatExpansionModule,
    QRCodeModule
  ],
  providers: [
    SpinnerService,
    SearchService,
    EngageService,
    CarouselBreakPointService,
    ConfigService,
    UserService,
    { provide: APP_BASE_HREF, useValue: '/ng' },
    { provide: MatDialogRef, useValue: {} },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
