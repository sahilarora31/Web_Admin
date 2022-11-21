import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfigService } from '@shared/services/config.service';
import { SpinnerService } from '@shared/services/spinner.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ActionButtonComponent } from '../shared/component/action-button/action-button.component';
import { LocationPopupComponent } from '../shared/component/location-popup/location-popup.component';
import { Partner } from '../shared/model/partner.model';
import { PartnerManagementService } from '../shared/service/partner-management.service';
import { Location } from '../shared/model/partner.model';
import { DeletePopupComponent } from '../shared/component/delete-popup/delete-popup.component';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';

@Component({
  selector: 'axis360-create-partner-management',
  templateUrl: './create-partner-management.component.html',
  styleUrls: ['./create-partner-management.component.scss']
})
export class CreatePartnerManagementComponent implements OnInit {
  panelPartnerState = true;
  panelLocationState = true;
  frameworkComponents: any;
  context: any;
  columns: ColDef[];
  rowData: any = [];
  gridOptions: GridOptions;
  partnerLocation: Location;
  gridApi: any;
  columnsApi: any;
  clickedRow: Location = new Location();
  deleteRow: Location = new Location();
  libraryList = [];
  createPartnerForm: FormGroup;
  noRowsTemplate: string;
  headerName: string = "Default Partner";

  constructor(public matDialog: MatDialog,
    private formBuilder: FormBuilder,
    public router: Router,
    public spinnerService: SpinnerService,
    public configService: ConfigService,
    public partnerService: PartnerManagementService,
    public toastMessageService: ToastMessageService) {
    this.frameworkComponents = {
      btnCellRenderer: ActionButtonComponent
    };
    this.context = { componentParent: this };
  }

  ngOnInit(): void {
    this.partnerService.isLocationsGrid = false;
    this.partnerService.showQRCodePopup = false;
    this.columns = [
      { headerName: 'Action', field: 'action', minWidth: 20, width: 108, sortable: false, filter: false, cellRenderer: ActionButtonComponent, suppressMovable: true },
      { headerName: 'Location Name', field: 'locationName', width: 196, sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'Address 1', field: 'streetAddress1', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'Address 2', field: 'streetAddress2', sortable: true, filter: true, hide: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'City', field: 'city', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'State', field: 'state', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'State Key', field: 'stateKey', sortable: true, filter: true, hide: true, suppressMovable: true }, { headerName: 'ZIP / Postal Code', field: 'zipPostalCode', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'Country', field: 'country', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'CountryKey', field: 'countryKey', sortable: true, filter: true, hide: true, suppressMovable: true }
    ];
    this.noRowsTemplate = `<em>ePopUp Library locations you create will be listed here.</em>`;

    let PartnerData: Partner = {
      partnerID: "",
      partnerName: "",
      ePopupLibraryID: "",
      contactName: "",
      contactEmail: "",
      contactPhone: ""
    };
    this.createPartnerForm = this.formBuilder.group({
      partnerName: [PartnerData.partnerName, [Validators.required]],
      ePopupLibraryID: [PartnerData.ePopupLibraryID, [Validators.required]],
      contactName: [PartnerData.contactName, [Validators.required]],
      contactEmail: [PartnerData.contactEmail,
      [Validators.required, Validators.pattern('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')]],
      contactPhone: [PartnerData.contactPhone]
    });
    this.getLibraryPrefixInfo();
  }

  getLibraryPrefixInfo() {
    this.partnerService.getLibraryPrefixInfo()
      .subscribe((result) => {
        this.libraryList = result.map(({ LibraryID, LibraryPrefix, LibraryName }) => ({ LibraryID, LibraryPrefix, LibraryName }));
      });
  }

  addPartner() {
    this.partnerService.setDisableAttribute();
    const partnerName = this.createPartnerForm.get('partnerName')?.value;
    const ePopupLibraryID = this.createPartnerForm.get('ePopupLibraryID')?.value;
    const contactName = this.createPartnerForm.get('contactName')?.value;
    const contactEmail = this.createPartnerForm.get('contactEmail')?.value;
    const isInvalidEmail = this.createPartnerForm.get('contactEmail')?.hasError('email', 'contactEmail');
    if (!partnerName || !ePopupLibraryID || !contactName || !contactEmail || isInvalidEmail) {
      this.partnerService.removeDisableAttribute();
      return;
    }
    const contactPhone = this.createPartnerForm.get('contactPhone')?.value;
    if (this.rowData.length === 0) {
      this.rowData.push({
        action: this.rowData.length + 1,
        locationName: 'Default Location',
        streetAddress1: this.partnerLocation?.streetAddress1,
        streetAddress2: this.partnerLocation?.streetAddress2,
        city: this.partnerLocation?.city,
        state: this.partnerLocation?.state?.value,
        stateKey: this.partnerLocation?.state?.key,
        zipPostalCode: this.partnerLocation?.zipPostalCode,
        country: this.partnerLocation?.country?.key,
        countryKey: this.partnerLocation?.country?.value
      });
      this.gridApi?.setRowData(this.rowData);
    }
    let PartnerData: Partner = {
      partnerID: null,
      partnerName: partnerName,
      ePopupLibraryID: ePopupLibraryID,
      contactName: contactName,
      contactEmail: contactEmail,
      contactPhone: contactPhone,
      locations: this.rowData
    };

    let isPartnerNameIsDuplicate = false;
    this.spinnerService.withObservable(this.partnerService.getPartnerList('-1')).subscribe((data) => {
      data.forEach((element: { PartnerName: any; }) => {
        if (!PartnerData.partnerName) {
          PartnerData.partnerName = this.partnerService.createDefaultNames(data, 'default partner', 'partner');
        }
        if (element.PartnerName === partnerName) {
          this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Partner Name should be unique.");
          isPartnerNameIsDuplicate = true;
          this.partnerService.removeDisableAttribute();
        }
      });
      if (!isPartnerNameIsDuplicate) {
        this.partnerService.addPartner(PartnerData).subscribe((result) => {
          if (result) {
            this.createPartnerForm.reset(true);
            this.router.navigateByUrl('partnermanagement/edit-partner-management/' + result);
            this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully Saved");
            this.partnerService.removeDisableAttribute();
          }
        });
      }
    }
    );
  }

  cancelPartner() {
    this.partnerService.popup = {
      header: 'Are you sure you want to Cancel your entry?',
      body_content1: 'If you cancel, any data entered on the prior screen will be deleted.',
      body_content2: '',
      cancelButtonText: 'GO BACK',
      submitButtonText: 'YES'
    };
    this.showDeleteDialog();
  }

  showDeleteDialog() {
    const modal = this.matDialog.open(DeletePopupComponent, {
      panelClass: 'delete-modal-container',
      disableClose: true
    });
    modal.afterClosed().subscribe((res: string) => {
      if (res === 'YES') {
        this.router.navigateByUrl('partnermanagement');
      }
    });
  }

  saveLocation(data: any) {
    if (data.Action === 'EDIT') {
      this.clickedRow = data;
      this.addNewLocation(false);
      return;
    }
    this.deleteRow = data.Col;
    for (let i = 0; i < this.rowData.length; i++) {
      if (this.rowData[i].action === this.deleteRow.action) {
        this.rowData.splice(i, 1);
        break;
      }
    }
    this.gridApi?.setRowData(this.rowData);
    this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully deleted");
  }

  addNewLocation(forEditScreen: boolean) {
    let modal;
    if (forEditScreen) {
      modal = this.matDialog.open(LocationPopupComponent, {
        panelClass: ['common-modal-container', 'add-new-location'],
        disableClose: true,
        data: { clickedRow: this.clickedRow, screen: "CREATE" }
      });
    }
    else {
      modal = this.matDialog.open(LocationPopupComponent, {
        panelClass: ['common-modal-container', 'add-new-location'],
        disableClose: true,
        data: { clickedRow: this.clickedRow, screen: "EDIT" }
      });
    }
    modal.afterClosed().subscribe((result: any) => {
      this.partnerLocation = result;
      let isEdit = this.partnerLocation.actionType === 'EDIT';
      let locations = this.rowData.filter((row: any) =>
        row.locationName.toLocaleLowerCase() === this.partnerLocation.locationName.toLocaleLowerCase() &&
        row.action !== this.partnerLocation.action);
      if (locations.length > 0) {
        this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Location Already Exists");
        return;
      }
      if (this.partnerLocation.actionType && isEdit) {
        let row = this.rowData.find((x: { locationID: string; }) => x.locationID === this.partnerLocation.locationId);
        row.locationName = this.partnerLocation.locationName;
        row.streetAddress1 = this.partnerLocation.streetAddress1;
        row.streetAddress2 = this.partnerLocation.streetAddress2;
        row.city = this.partnerLocation.city;
        row.state = this.partnerLocation.state?.value;
        row.stateKey = this.partnerLocation.state?.key;
        row.zipPostalCode = this.partnerLocation.zipPostalCode;
        row.country = this.partnerLocation.country.key;
        row.countryKey = this.partnerLocation.country.value;
      } else {
        this.rowData.push({
          action: this.rowData.length + 1,
          locationName: this.partnerLocation.locationName,
          streetAddress1: this.partnerLocation.streetAddress1,
          streetAddress2: this.partnerLocation.streetAddress2,
          city: this.partnerLocation.city,
          state: this.partnerLocation.state.value,
          stateKey: this.partnerLocation.state.key,
          zipPostalCode: this.partnerLocation.zipPostalCode,
          country: this.partnerLocation.country.key,
          countryKey: this.partnerLocation.country.value
        });
      }
      this.gridApi?.setRowData(this.rowData);
      this.clickedRow = new Location();
      this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully Saved");
    });
  }

  displayHeaderName() {
    let partnerName = this.createPartnerForm.get('partnerName')?.value;
    if (partnerName.length > 0) {
      this.headerName = partnerName;
    } else {
      this.headerName = "Default Partner"
    }
  }

  keyPressEvent(event: any) {
    var keyCode = (event.which) ? event.which : event.keyCode;
    if ((keyCode >= 65 && keyCode <= 90) || (keyCode >= 97 && keyCode <= 122)) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnsApi = params.columnsApi;
    params.api.sizeColumnsToFit();
  }
}
