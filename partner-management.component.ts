import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigService } from '@shared/services/config.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { ColDef } from 'ag-grid-community';
import { ActionButtonComponent } from './shared/component/action-button/action-button.component';
import { PartnerManagementService } from './shared/service/partner-management.service';
import { MatDialog } from '@angular/material/dialog';
import { DeletePopupComponent } from './shared/component/delete-popup/delete-popup.component';

@Component({
  selector: 'axis360-partner-management',
  templateUrl: './partner-management.component.html',
  styleUrls: ['./partner-management.component.scss']
})
export class PartnerManagementComponent implements OnInit {
  frameworkComponents: any;
  context: any;
  columns: ColDef[] | undefined;
  rowData: any[] = [];
  deleteResponse: any;
  noRowsTemplate: string;

  constructor(public configService: ConfigService,
  public router: Router,
  public partnerService: PartnerManagementService,
  public spinnerService: SpinnerService,
  public toastMessageService: ToastMessageService,
  public matDialog: MatDialog) {
    this.frameworkComponents = {
      btnCellRenderer: ActionButtonComponent
    };

    this.context = { componentParent: this };
  }

  ngOnInit() {
    this.partnerService.isLocationsGrid = false;
    this.columns = [
      { field: 'PartnerID', headerName: 'Action',
        minWidth: 100, maxWidth: 100, sortable: false, filter: false, resizable: false,
        cellRenderer: ActionButtonComponent , suppressMovable: true},
      { field: 'PartnerName', headerName: 'Partner Name',
        minWidth: 150, maxWidth: 250, sortable: true, filter: true, resizable: true,
        filterParams: {
          buttons: ['clear']
        }, suppressMovable: true
      },
      { field: 'EPopupLibraryPrefix', headerName: 'ePopup Prefix',
        minWidth: 150, maxWidth: 250, sortable: true, filter: true, resizable: true ,
        filterParams: {
          buttons: ['clear']
        }, suppressMovable: true
      },
      { field: 'EPopupLibraryUrl', headerName: 'EPopup Site URL',
        sortable: true, filter: true, resizable: false,
        cellRenderer: (libraryUrl) =>
              `<a target="_blank" href="${libraryUrl.value}">${libraryUrl.value}</a>`,
         filterParams: {
          buttons: ['clear']
        } ,
        cellClass: 'url-cell',
        suppressMovable: true
      },
    ];
    this.noRowsTemplate = 'ePopUp Library partners you create will be listed here';
    this.getPartnerList();
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
  }
  getPartnerList() {
    this.spinnerService
    .withObservable(this.partnerService.getPartnerList('-1'))
    .subscribe(
      (data) => {
        this.rowData = data;
      }
    );
  }

  saveLocation(data: any) {
    if (data.Action === 'EDIT') {
      this.addNewPartner(false, data.Col.PartnerID);
      return;
    }
    this.partnerService.popup = {
      header : 'Are You Sure You Want to Delete this Partner?',
      body_content1 : 'Deleting a Partner will disable access for all users from the Partner and QR-code access from all associated Partner Locations.',
      body_content2 : 'Do you want to delete this Partner?',
      cancelButtonText : 'NO',
      submitButtonText : 'YES'
    };
    this.showDeleteDialog(data.Col.PartnerID);
  }

  addNewPartner(isCreate: boolean, partnerId: number = 0){
    if (isCreate){
      this.router.navigateByUrl('partnermanagement/create-partner-management');
      return;
    }
    this.router.navigateByUrl('partnermanagement/edit-partner-management/' + partnerId);
  }

  deletePartner(partnerId: string) {
    this.spinnerService
    .withObservable(this.partnerService.deletePartner(partnerId))
    .subscribe(
      (data) => {
        this.deleteResponse = data;
        this.getPartnerList();
      }
    );
  }

  showDeleteDialog(partnerId: string) {
    const modal = this.matDialog.open(DeletePopupComponent, {
      panelClass: 'delete-modal-container',
      disableClose: true
    });
    modal.afterClosed().subscribe((res : string) => {
        if(res === 'YES'){
          this.deletePartner(partnerId);
        }
    });
  }
}

