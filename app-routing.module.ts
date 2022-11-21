import { NgModule } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ProgramListingComponent } from './core/programs/program-listing/program-listing.component';
import { ProgramDetailComponent } from './core/programs/program-detail/program-detail.component';
import { MyProgramListComponent } from './core/programs/program-listing/my-program-list/my-program-list.component';
import { DraftProgramListComponent } from './core/programs/program-listing/draft-program-list/draft-program-list.component';
import { ActiveProgramListComponent } from './core/programs/program-listing/active-program-list/active-program-list.component';
import { ClosedProgramListComponent } from './core/programs/program-listing/closed-program-list/closed-program-list.component';
import { MainComponent } from './core/main/main.component';
import { PartnerManagementComponent } from './core/partner-management/partner-management.component';
import { CreatePartnerManagementComponent } from './core/partner-management/create-partner-management/create-partner-management.component';
import { EditPartnerManagementComponent } from './core/partner-management/edit-partner-management/edit-partner-management.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'programs',
        component: ProgramListingComponent,
        children: [
          {
            path: '',
            component: MyProgramListComponent,
          },
          {
            path: 'draft',
            component: DraftProgramListComponent,
          },
          {
            path: 'active',
            component: ActiveProgramListComponent,
          },
          {
            path: 'closed',
            component: ClosedProgramListComponent,
          },
        ],
      },
      {
        path: 'program/:programId',
        component: ProgramDetailComponent,
      },
      {
        path: 'program/:programId/:activeTab',
        component: ProgramDetailComponent,
      },
      {
        path: 'partnermanagement',
        component: PartnerManagementComponent,
      },
      {
        path: 'partnermanagement/create-partner-management',
        component: CreatePartnerManagementComponent,
      },
      {
        path: 'partnermanagement/edit-partner-management/:partnerId',
        component: EditPartnerManagementComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: APP_BASE_HREF, useValue: '/' }],
})
export class AppRoutingModule {}
