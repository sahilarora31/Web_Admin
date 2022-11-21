import { unescapeIdentifier } from '@angular/compiler';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SpinnerService } from '@shared/services/spinner.service';
import { Location, State, Country } from '../../model/partner.model';
import { PartnerManagementService } from '../../service/partner-management.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { MESSAGE_TPYE } from '@shared/constants/common.constants';

@Component({
  selector: 'axis360-location-popup',
  templateUrl: './location-popup.component.html',
  styleUrls: ['./location-popup.component.scss']
})
export class LocationPopupComponent implements OnInit {
  title: string;
  partnerLocation: Location;
  action: string;
  actionType: string;
  locationName: string;
  locationId: string;
  streetAddress1: string;
  streetAddress2: string;
  city: string;
  zipPostalCode: string;
  states: State[];
  countries: Country[];
  selectedState: State;
  selectedCountry: Country = { key: 'United States of America', value: 'US' };
  createLocationResponse: boolean;
  stateDetails: string;
  clickedRow: any;
  qrCode: string;
  libraryId: string = '';
  partnerId: string = '';
  epopupSiteURL: string = '';
  showQRCodePopup: boolean = false;

  constructor(@Inject(MAT_DIALOG_DATA) public modaldata: any,
    public locationDialog: MatDialogRef<LocationPopupComponent>,
    private spinnerService: SpinnerService,
    public partnerService: PartnerManagementService,
    public clipboard: Clipboard,
    public toastMessageService: ToastMessageService) {
  }

  ngOnInit(): void {
    this.clickedRow = this.modaldata;
    this.partnerLocation = new Location();
    this.showQRCodePopup = this.partnerService.showQRCodePopup;
    if (Object.keys(this.clickedRow.clickedRow).length == 0 || this.clickedRow.screen == 'CREATE') {
      this.partnerService.showQRCodePopup = false;
      this.title = 'Create Location QR Code';
      this.spinnerService
        .withObservable(this.partnerService.getCountriesList())
        .subscribe(
          (result) => {
            if (result && result.length > 0) {
              this.countries = result;
              this.selectedCountry = this.countries[0];
            }
          }
        );

      this.spinnerService
        .withObservable(this.partnerService.getStatesList())
        .subscribe(
          (result) => {
            if (result && result.length > 0) {
              this.states = result;
              this.selectedState = this.states[0];
            }
          }
        );
    }
    else if (this.clickedRow.screen == 'DOWNLOAD') {
      this.libraryId = this.clickedRow.clickedRow.Col.libraryId;
      this.epopupSiteURL = this.clickedRow.clickedRow.Col.ePopUpSiteUrl;
      this.partnerId = this.clickedRow.clickedRow.Col.partnerID;
      this.locationId = this.clickedRow.clickedRow.Col.locationID;
      this.partnerService.getEpopupSiteUrl()
      .subscribe(
        (result) => {
          if (result && result.length > 0) {
            this.epopupSiteURL = result;
            if (this.libraryId && this.partnerId && this.locationId && this.epopupSiteURL) {
              this.generateQRCode();
            }
          }
        }
      );
    }
    else {
      this.editLocationDetails();
    }
  }

  editLocationDetails() {
    this.title = 'Edit Location QR Code';
    this.actionType = this.clickedRow.clickedRow.Action;
    this.action = this.clickedRow.clickedRow.Col.action;
    this.locationName = this.clickedRow.clickedRow.Col.locationName;
    this.locationId = this.clickedRow.clickedRow.Col.locationID;
    this.streetAddress1 = this.clickedRow.clickedRow.Col.streetAddress1;
    this.streetAddress2 = this.clickedRow.clickedRow.Col.streetAddress2;
    this.city = this.clickedRow.clickedRow.Col.city;
    this.zipPostalCode = this.clickedRow.clickedRow.Col.zip;
    this.spinnerService
      .withObservable(this.partnerService.getCountriesList())
      .subscribe(
        (result) => {
          if (result && result.length > 0) {
            this.countries = result;
            for (let i = 0; i < this.countries.length; i++) {
              if (this.countries[i].value === this.clickedRow.clickedRow.Col.countryKey || this.countries[i].key === this.clickedRow.clickedRow.Col.countryKey) {
                this.selectedCountry = this.countries[i];
                break;
              }
              if (this.clickedRow.clickedRow.Col.countryKey === "") {
                this.selectedCountry = this.countries[0];
                break;
              }
            }
          }
          this.spinnerService
            .withObservable(this.partnerService.getStatesList())
            .subscribe(
              (result) => {
                if (result && result.length > 0) {
                  this.states = result;
                  for (let i = 0; i < this.states.length; i++) {
                    if (this.clickedRow.clickedRow.Col.countryKey === 'US' || this.clickedRow.clickedRow.Col.countryKey === 'United States of America') {
                      if (this.states[i].value === this.clickedRow.clickedRow.Col.stateKey) {
                        this.selectedState = this.states[i];
                        break;
                      }
                      if (this.clickedRow.clickedRow.Col.stateKey === "") {
                        this.selectedState = this.states[0];
                        break;
                      }
                    }
                    else {
                      this.stateDetails = this.clickedRow.clickedRow.Col.stateKey;
                    }
                  }
                }
              }
            );
        }
      );
  }

  copyLink(inputElement) {  
    this.clipboard.copy(inputElement.firstChild.textContent);
    this.toastMessageService.showSnackBar(MESSAGE_TPYE.SUCCESS, "Copied to Clipboard");
  }

  downloadQRCode() {
    var canvas = document.getElementsByTagName("canvas")[0];
    var image = canvas.toDataURL("image/png");
    var link = document.createElement('a');
    link.download = this.partnerId.toString() + this.locationId.toString() + ".png";
    link.href = image;
    link.click()
  }

  generateQRCode() {
    this.qrCode = this.epopupSiteURL + '?partnerId=' + this.partnerId + '&locationId=' + this.locationId + '&libraryId=' + this.libraryId;
  }

  cancelLocation() {
    this.locationDialog.close();
  }

  viewLocation() {
    this.partnerService.showQRCodePopup = false;
    this.editLocationDetails();
  }


  saveLocation() {
    this.initializeLocationDetails();
    this.locationDialog.close(this.partnerLocation);
  }

  initializeLocationDetails() {
    this.partnerLocation.actionType = this.actionType;
    this.partnerLocation.action = this.action;
    this.partnerLocation.locationName = this.locationName;
    this.partnerLocation.locationId = this.locationId;
    this.partnerLocation.streetAddress1 = this.streetAddress1;
    this.partnerLocation.streetAddress2 = this.streetAddress2;
    this.partnerLocation.city = this.city;
    this.partnerLocation.zipPostalCode = this.zipPostalCode;
    this.partnerLocation.country = this.selectedCountry;
    if (this.selectedCountry.value === 'US') {
      this.partnerLocation.state = this.selectedState;
    }
    else {
      this.partnerLocation.state = new State();
      this.partnerLocation.state.key = this.stateDetails;
      this.partnerLocation.state.value = this.stateDetails;
    }
    if (!this.stateDetails && this.selectedState?.value === '') {
      this.partnerLocation.state = new State();
    }
  }
}
