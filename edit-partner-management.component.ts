import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';
import { SpinnerService } from '@shared/services/spinner.service';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { ColDef, GridOptions } from 'ag-grid-community';
import { ActionButtonComponent } from '../shared/component/action-button/action-button.component';
import { DeletePopupComponent } from '../shared/component/delete-popup/delete-popup.component';
import { LocationPopupComponent } from '../shared/component/location-popup/location-popup.component';
import { Location, CreatePartnerLocation, Partner } from '../shared/model/partner.model';
import { PartnerManagementService } from '../shared/service/partner-management.service';

@Component({
  selector: 'axis360-edit-partner-management',
  templateUrl: './edit-partner-management.component.html',
  styleUrls: ['./edit-partner-management.component.scss']
})
export class EditPartnerManagementComponent implements OnInit {
  panelPartnerState = true;
  panelLocationState = true;
  frameworkComponents: any;
  context: any;
  columns: ColDef[] | undefined;
  gridOptions: GridOptions;
  rowData: any = [];
  partnerLocation: Location;
  gridApi: any;
  columnsApi: any;
  clickedRow: Location = new Location();
  deleteRow: Location = new Location();
  partnerId: string = "0";
  ePopupSiteList = [];
  editPartnerForm: FormGroup;
  ePopupSiteUrl: string;
  noRowsTemplate: string;
  headerName: string = "Default Partner";

  constructor(public matDialog: MatDialog,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private spinnerService: SpinnerService,
    private partnerService: PartnerManagementService,
    public router: Router,
    public toastMessageService: ToastMessageService) {
    this.frameworkComponents = {
      btnCellRenderer: ActionButtonComponent
    };
    this.context = { componentParent: this };
  }

  ngOnInit(): void {
    this.partnerService.isLocationsGrid = true;
    this.partnerId = this.route.snapshot.params.partnerId;
    this.getLibraryPrefixInfo();
    this.columns = [
      { headerName: 'Action', field: 'Action', minWidth: 20, width: 108, sortable: false, suppressMovable: true, filter: false, cellRenderer: ActionButtonComponent },
      { headerName: 'Location Name', field: 'locationName', width: 196, sortable: true, suppressMovable: true, filter: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'Location ID', field: 'locationID', sortable: true, suppressMovable: true, filter: true, hide: true },
      { headerName: 'Address 1', field: 'streetAddress1', sortable: true, suppressMovable: true, filter: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'Address 2', field: 'streetAddress2', sortable: true, suppressMovable: true, filter: true, hide: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'City', field: 'city', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'State', field: 'state', sortable: true, filter: true, suppressMovable: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'State Key', field: 'stateKey', sortable: true, suppressMovable: true, filter: true, hide: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'ZIP / Postal Code', field: 'zip', sortable: true, suppressMovable: true, filter: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'Country', field: 'country', sortable: true, suppressMovable: true, filter: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'CountryKey', field: 'countryKey', sortable: true, suppressMovable: true, filter: true, hide: true, filterParams: { buttons: ['clear'] } },
      { headerName: 'LibraryId', field: 'libraryId', sortable: true, suppressMovable: true, filter: true, hide: true },
      { headerName: 'EPopUpSiteUrl', field: 'ePopUpSiteUrl', sortable: true, suppressMovable: true, filter: true, hide: true },
      { headerName: 'PartnerId', field: 'partnerId', sortable: true, suppressMovable: true, filter: true, hide: true }
    ];
    this.noRowsTemplate = `<em>ePopUp Library locations you create will be listed here.</em>`;
    this.editPartnerForm = this.formBuilder.group({
      partnerName: new FormControl(),
      ePopupLibraryID: new FormControl(),
      contactName: new FormControl(),
      contactEmail: new FormControl(),
      contactPhone: new FormControl()
    });
  }

  getPartner() {
    this.partnerService.getPartnerList(this.partnerId)
      .subscribe((result) => {
        let data = result[0];
        this.ePopupSiteUrl = data.EPopupLibraryUrl;
        let PartnerData: Partner = {
          partnerID: this.partnerId,
          partnerName: data.PartnerName,
          ePopupLibraryID: data.EPopupLibraryID,
          contactName: data.ContactName,
          contactEmail: data.ContactEmail,
          contactPhone: data.ContactPhone
        };
        let ePopup = this.ePopupSiteList.find(x => x.LibraryID === PartnerData.ePopupLibraryID)
        this.editPartnerForm = this.formBuilder.group({
          partnerName: [PartnerData.partnerName],
          ePopupLibraryID: [ePopup, [Validators.required]],
          contactName: [PartnerData.contactName, [Validators.required]],
          contactEmail: [PartnerData.contactEmail, [Validators.required, Validators.pattern('[a-zA-Z0-9.-_]{1,}@[a-zA-Z.-]{2,}[.]{1}[a-zA-Z]{2,}')]],
          contactPhone: [PartnerData.contactPhone]
        });

        this.partnerService.getLocationsList(this.partnerId)
          .subscribe((result) => {
            result.forEach((row: any) => {
              let item = {
                partnerID: row.PartnerID,
                locationName: row.LocationName,
                locationID: row.LocationID,
                streetAddress1: row.StreetAddress1,
                streetAddress2: row.StreetAddress2,
                city: row.City,
                state: row.State,
                stateKey: row.State,
                zip: row.ZipPostalcode,
                country: row.Country,
                countryKey: row.Country,
                libraryId: data.EPopupLibraryID,
                ePopUpSiteUrl: this.ePopupSiteUrl,
              }
              this.rowData.push(item);
            })
            this.gridApi?.setRowData(this.rowData);
          });

      });
  }

  getLibraryPrefixInfo() {
    this.partnerService.getLibraryPrefixInfo()
      .subscribe((result) => {
        this.ePopupSiteList = result.map(({ LibraryID, LibraryPrefix, LibraryName }) => ({ LibraryID, LibraryPrefix, LibraryName }));
        this.getPartner();
      });
  }

  cancelPartner() {
    this.partnerService.popup = {
      header: 'Are you sure you want to Cancel your entry?',
      body_content1: 'If you cancel, any data entered on the prior screen will be deleted.',
      body_content2: '',
      cancelButtonText: 'GO BACK',
      submitButtonText: 'YES'
    };
    this.showCancelDialog();
  }

  showCancelDialog() {
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

  confirmDeleteLocation(data) {
    this.partnerService.popup = {
      header: 'Are you sure you want to Delete this Location? ',
      body_content1: 'Deleting a Location will deny access for all current users, and disable the QR-code for this Location.',
      body_content2: '',
      cancelButtonText: 'NO',
      submitButtonText: 'YES'
    };
    this.showDeleteDialog(data);
  }

  showDeleteDialog(data) {
    const modal = this.matDialog.open(DeletePopupComponent, {
      panelClass: 'delete-modal-container',
      disableClose: true
    });
    modal.afterClosed().subscribe((res: string) => {
      if (res === 'YES') {
        this.deleteLocation(data);
      }
    });
  }

  updatePartner() {
    const ePopupLibraryID = this.editPartnerForm.value?.ePopupLibraryID?.LibraryID;
    const contactName = this.editPartnerForm.value?.contactName;
    const contactEmail = this.editPartnerForm.value?.contactEmail;
    const isValidEmail = this.editPartnerForm.get('contactEmail')?.hasError('email', 'contactEmail');
    if (!ePopupLibraryID || !contactName || !contactEmail || isValidEmail) return;
    const partnerName = this.editPartnerForm.value.partnerName;
    const contactPhone = this.editPartnerForm.value.contactPhone;
    let PartnerData: Partner = {
      partnerID: this.partnerId,
      partnerName: partnerName,
      ePopupLibraryID: ePopupLibraryID,
      contactName: contactName,
      contactEmail: contactEmail,
      contactPhone: contactPhone
    };
    this.partnerService.updatePartner(PartnerData)
      .subscribe((result) => {
        if (result) {
          this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully Saved");
        } else
          this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Error occured");
      });
    return true;
  }

  saveLocation(data: any) {
    this.partnerService.showQRCodePopup = false;
    if (data.Action === 'EDIT') {
      this.clickedRow = data;
      this.addNewLocation(false);
      return;
    } else if (data.Action === 'DELETE') {
      console.log(JSON.stringify(data));
      this.confirmDeleteLocation(data)
    } else if (data.Action === 'DOWNLOAD') {
      this.clickedRow = data;
      this.partnerService.showQRCodePopup = true;
      const modal = this.matDialog.open(LocationPopupComponent, {
        panelClass: ['common-modal-container', 'add-new-location'],
        disableClose: true,
        data: { clickedRow: this.clickedRow, screen: 'DOWNLOAD' }
      });
      modal.afterClosed().subscribe((result) => {
        this.partnerLocation = result;
        this.updatePartnerLocation();
        this.clickedRow = new Location();
      });
    }
  }

  addNewLocation(forEditScreen: boolean) {
    let modal: any;
    if (forEditScreen) {
      modal = this.matDialog.open(LocationPopupComponent, {
        panelClass: ['common-modal-container', 'add-new-location'],
        disableClose: true,
        data: { clickedRow: this.clickedRow, screen: "CREATE" }
      });
    } else {
      modal = this.matDialog.open(LocationPopupComponent, {
        panelClass: ['common-modal-container', 'add-new-location'],
        disableClose: true,
        data: { clickedRow: this.clickedRow, screen: "EDIT" }
      });
    }
    modal.afterClosed().subscribe((result: Location) => {
      this.partnerLocation = result;
      let locations = this.rowData.filter((row: any) =>
        row.locationName.toLocaleLowerCase() === this.partnerLocation.locationName.toLocaleLowerCase() &&
        row.locationID !== this.partnerLocation.locationId);
      if (locations.length > 0) {
        this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Location Already Exists");
        return;
      }
      this.checkAssignDefaultPartnerName();
      if (this.partnerLocation.actionType) {
        this.updatePartnerLocation();
      } else {
        this.createNewPartnerLocation();
      }
      this.clickedRow = new Location();
    });
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

  private createNewPartnerLocation() {
    this.checkAssignDefaultPartnerName();
    this.rowData.push({
      action: this.rowData.length + 1,
      locationName: this.partnerLocation.locationName,
      locationID: this.partnerLocation.locationId,
      streetAddress1: this.partnerLocation.streetAddress1,
      streetAddress2: this.partnerLocation.streetAddress2,
      city: this.partnerLocation.city,
      state: this.partnerLocation.state?.value,
      stateKey: this.partnerLocation.state?.key,
      zip: this.partnerLocation.zipPostalCode,
      country: this.partnerLocation.country?.key,
      countryKey: this.partnerLocation.country?.value,
      libraryId: this.editPartnerForm.value?.ePopupLibraryID?.LibraryID,
      ePopUpSiteUrl: this.ePopupSiteUrl,
      partnerID: this.partnerId
    });
    let createPartnerLocation = this.createPartnerLocationInfo()
    if (!this.partnerLocation.actionType) {
      this.spinnerService
        .withObservable(this.partnerService.createPartnerLocation(createPartnerLocation))
        .subscribe((result) => {
          if (result) {
            //Saved Successfully
            this.rowData[this.rowData.length - 1].locationID = result;
            this.gridApi?.setRowData(this.rowData);
            this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully Saved");
          } else {
            this.toastMessageService.showSnackBar(MESSAGE_TPYE.INFO, "Could not save the location");
          }
        }, (error) => {
          //Error
          this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Error occured");
        });
    }
  }

  private checkAssignDefaultPartnerName() {
    if (!this.partnerLocation.locationName) {
      this.partnerLocation.locationName = this.partnerService.createDefaultNames(this.rowData, 'default location', 'location');
    }
  }

  private createPartnerLocationInfo() {
    let createPartnerLocation = new CreatePartnerLocation();
    createPartnerLocation.partnerId = this.partnerId;
    createPartnerLocation.locationId = this.partnerLocation.locationId;
    createPartnerLocation.locationName = this.partnerLocation.locationName;
    createPartnerLocation.city = this.partnerLocation.city;
    createPartnerLocation.country = this.partnerLocation.country?.key;
    createPartnerLocation.state = this.partnerLocation.state?.key;
    createPartnerLocation.streetAddress1 = this.partnerLocation.streetAddress1;
    createPartnerLocation.streetAddress2 = this.partnerLocation.streetAddress2;
    createPartnerLocation.zipPostalCode = this.partnerLocation.zipPostalCode;
    return createPartnerLocation;
  }

  private updatePartnerLocation() {
    this.checkAssignDefaultPartnerName();
    this.updatePartnerLocationInfo();
    let createPartnerLocation = this.createPartnerLocationInfo();
    this.spinnerService.withObservable(this.partnerService.editPartnerLocation(createPartnerLocation)).subscribe((result) => {
      if (result) {
        this.gridApi?.setRowData(this.rowData);
        this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully Saved");
      } else {
        this.toastMessageService.showSnackBar(MESSAGE_TPYE.INFO, "Could not save the location");
      }
    }, (error) => {
      this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Error occured");
    });
  }

  private updatePartnerLocationInfo() {
    let row = this.rowData.find((x: { locationID: string; }) => x.locationID === this.partnerLocation.locationId);
    row.partnerID = this.partnerId;
    row.locationName = this.partnerLocation.locationName;
    row.streetAddress1 = this.partnerLocation.streetAddress1;
    row.streetAddress2 = this.partnerLocation.streetAddress2;
    row.city = this.partnerLocation.city;
    row.state = this.partnerLocation.state?.value;
    row.stateKey = this.partnerLocation.state?.key;
    row.zip = this.partnerLocation.zipPostalCode;
    row.country = this.partnerLocation.country?.key;
    row.countryKey = this.partnerLocation.country?.value;
    row.ePopUpSiteUrl = this.ePopupSiteUrl;
    row.libraryId = this.editPartnerForm.value?.ePopupLibraryID?.LibraryID;
  }

  private deleteLocation(data: any) {
    this.deleteRow = data.Col;
    for (let i = 0; i < this.rowData.length; i++) {
      if (this.rowData[i].locationID === data.Col.locationID) {
        this.spinnerService
          .withObservable(this.partnerService.deletePartnerLocation(data.Col.locationID))
          .subscribe((result) => {
            if (result) {
              this.rowData.splice(i, 1);
              this.gridApi?.setRowData(this.rowData);
              this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Successfully Deleted");
            } else {
              this.toastMessageService.showSnackBar(MESSAGE_TPYE.INFO, "Could not delete the location");
            }
          }, (error) => {
            this.toastMessageService.showSnackBar(MESSAGE_TPYE.ERROR, "Error occured");
          });
        break;
      }
    }
  }

  displayHeaderName() {
    let partnerName = this.editPartnerForm.get('partnerName')?.value;
    if (partnerName.length > 0) {
      this.headerName = partnerName;
    } else {
      this.headerName = "Default Partner"
    }
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.columnsApi = params.columnsApi;
    params.api.sizeColumnsToFit();
  }
}
