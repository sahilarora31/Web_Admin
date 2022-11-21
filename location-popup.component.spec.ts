import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AgGridModule } from 'ag-grid-angular';
import { of } from 'rxjs';
import { ActionButtonComponent } from '../action-button/action-button.component';
import { noop } from '@shared/classes/util';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LocationPopupComponent } from './location-popup.component';
import { SpinnerService } from '@shared/services/spinner.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PartnerManagementService } from '../../service/partner-management.service';
import { ToastMessageService } from '@shared/services/toast-message.service';

describe('LocationPopupComponent', () => {
  let component: LocationPopupComponent;
  let fixture: ComponentFixture<LocationPopupComponent>;
  let partnerService: PartnerManagementService;
  let toastMessageService: ToastMessageService;
  const countryResponse = [{ key: 'United States of America', value: 'US' },
  { key: 'Afghanistan', value: 'AF' },
  { key: 'Aland Islands', value: 'AX' },
  { key: '', value: '' }];
  const StatesResponse = [{ key: 'Select State', value: '' },
  { key: 'Alabama', value: 'Alabama' },
  { key: 'Alaska', value: 'Alaska' },
  { key: 'Texas', value: 'Texas' }];
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, AgGridModule, MatExpansionModule, BrowserAnimationsModule, MatSnackBarModule, HttpClientTestingModule],
      declarations: [LocationPopupComponent, ActionButtonComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: MatDialogRef, useValue: {
            backdropClick: () => of(),
            afterOpened: () => of(),
            afterClosed: () => of(),
            close: noop,
          },
        },
        SpinnerService
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LocationPopupComponent);
    component = fixture.componentInstance;
    component.modaldata = {
      clickedRow: {
        "Action": "EDIT",
        "Row": 0,
        "Col": {
          "action": 1,
          "locationName": "Test Location",
          "streetAddress1": "Street 1",
          "streetAddress2": "Street 2",
          "city": "Texas",
          "state": "Texas",
          "stateKey": "Texas",
          "zipPostalCode": 100001,
          "country": "United States of America",
          "countryKey": "US"
        }
      },
      screen: "EDIT"
    };
    partnerService = TestBed.inject(PartnerManagementService);
    toastMessageService = TestBed.inject(ToastMessageService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('describe init CREATE', () => {
    it('should call init with Add Location', () => {
      component.modaldata = {
        clickedRow: {},
        screen: "CREATE"
      };
      fixture.detectChanges();
      const spyGetCountries = spyOn(
        partnerService,
        'getCountriesList'
      ).and.returnValue(of(countryResponse));
      const spyGetStates = spyOn(
        partnerService,
        'getStatesList'
      ).and.returnValue(of(StatesResponse));
      component.ngOnInit();
      expect(spyGetCountries).toHaveBeenCalledWith();
      expect(spyGetStates).toHaveBeenCalledWith();
    });
    it('should call init with Edit Location', () => {
      component.modaldata = {
        clickedRow: {
          "Action": "EDIT",
          "Row": 0,
          "Col": {
            "action": 1,
            "locationName": "Test Location",
            "streetAddress1": "Street 1",
            "streetAddress2": "Street 2",
            "city": "Texas",
            "state": "Texas",
            "stateKey": "Texas",
            "zipPostalCode": 100001,
            "country": "United States of America",
            "countryKey": "US"
          }
        },
        screen: "EDIT"
      };
      fixture.detectChanges();
      const spyGetCountries = spyOn(
        partnerService,
        'getCountriesList'
      ).and.returnValue(of(countryResponse));
      const spyGetStates = spyOn(
        partnerService,
        'getStatesList'
      ).and.returnValue(of(StatesResponse));
      component.ngOnInit();
      expect(spyGetCountries).toHaveBeenCalledWith();
      expect(spyGetStates).toHaveBeenCalledWith();
    });
    it('should call init with Download', () => {
      let result = {
        clickedRow: { Col: { libraryId: "test", ePopUpSiteUrl: "test", partnerID: "test", locationID: "test" } },
        screen: "DOWNLOAD"
      };
      component.modaldata = result;
      spyOn(partnerService, 'getEpopupSiteUrl').and.returnValue(of([result]));
      fixture.detectChanges();
      component.ngOnInit();
      expect(component.qrCode).toEqual('[object Object]?partnerId=test&locationId=test&libraryId=test');
    });
  });

  describe('describe cancelLocation', () => {
    it('should call cancelLocation ', () => {
      spyOn(component.locationDialog, 'close');
      component.cancelLocation();
      expect(component.locationDialog.close).toHaveBeenCalled();
    });
  });

  describe('describe saveLocation', () => {
    it('should call saveLocation with US Location', () => {
      spyOn(component, 'initializeLocationDetails').and.callThrough();
      component.partnerLocation = {
        actionType: "EDIT",
        action: "1",
        locationName: "Test Location",
        streetAddress1: "Street 1",
        streetAddress2: "Street 2",
        city: "Texas",
        state: { key: "Texas", value: "Texas" },
        zipPostalCode: "100001",
        country: { key: "United States of America", value: "US" }
      }
      component.saveLocation();
      expect(component.initializeLocationDetails).toHaveBeenCalled();
    });
    it('should call saveLocation with other than US Location', () => {
      spyOn(component, 'initializeLocationDetails').and.callThrough();
      component.partnerLocation = {
        actionType: "EDIT",
        action: "1",
        locationName: "Test Location",
        streetAddress1: "Street 1",
        streetAddress2: "Street 2",
        city: "Tirana",
        state: { key: "Tirana", value: "Tirana" },
        zipPostalCode: "100001",
        country: { key: "Albania", value: "AL" }
      }
      component.selectedCountry = { key: "Albania", value: "AL" };
      component.stateDetails = "";
      component.selectedState = { key: "", value: "" };
      fixture.detectChanges();
      component.saveLocation();
      expect(component.initializeLocationDetails).toHaveBeenCalled();
    });
  });

  describe('describe viewLocation', () => {
    it('should call viewLocation', () => {
      spyOn(component, 'editLocationDetails').and.callThrough();
      spyOn(partnerService, 'getCountriesList').and.returnValue(of(countryResponse));
      spyOn(partnerService, 'getStatesList').and.returnValue(of(StatesResponse));
      component.viewLocation();
      expect(component.editLocationDetails).toHaveBeenCalled();
    });
  });

  describe('describe editLocationDetails', () => {
    it('should call editLocationDetails', () => {
      spyOn(component, 'editLocationDetails').and.callThrough();
      spyOn(partnerService, 'getCountriesList').and.returnValue(of(countryResponse));
      spyOn(partnerService, 'getStatesList').and.returnValue(of(StatesResponse));
      component.viewLocation();
      expect(component.editLocationDetails).toHaveBeenCalled();
    });

    it('should call editLocationDetails With Key', () => {
      spyOn(component, 'editLocationDetails').and.callThrough();
      const countryResponse = [{ key: '', value: '' }];
      const StatesResponse = [ { key: 'Texas', value: 'Texas' }];
      component.modaldata.clickedRow.Col.countryKey = "United States of America";
      spyOn(partnerService, 'getCountriesList').and.returnValue(of(countryResponse));
      spyOn(partnerService, 'getStatesList').and.returnValue(of(StatesResponse));
      component.viewLocation();
      expect(component.editLocationDetails).toHaveBeenCalled();
    });

    it('should call editLocationDetails With Empty Key', () => {
      spyOn(component, 'editLocationDetails').and.callThrough();
      const StatesResponse = [ { key: 'Texas', value: 'Texas' }];
      component.modaldata.clickedRow.Col.countryKey = "";
      component.modaldata.clickedRow.Col.stateKey = "Texas";
      spyOn(partnerService, 'getCountriesList').and.returnValue(of(countryResponse));
      spyOn(partnerService, 'getStatesList').and.returnValue(of(StatesResponse));
      component.viewLocation();
      expect(component.editLocationDetails).toHaveBeenCalled();
    });

    it('should call editLocationDetails With Empty state Key', () => {
      spyOn(component, 'editLocationDetails').and.callThrough();
      const StatesResponse1 = [ { key: 'Texas', value: 'Texas' }];
      component.clickedRow.clickedRow.Col.stateKey = "";
      spyOn(partnerService, 'getCountriesList').and.returnValue(of(countryResponse));
      spyOn(partnerService, 'getStatesList').and.returnValue(of(StatesResponse1));
      component.viewLocation();
      expect(component.editLocationDetails).toHaveBeenCalled();
    });
  });

  describe('describe generateQRCode', () => {
    it('should call generateQRCode', () => {
      component.generateQRCode();
      const equalTo = "?partnerId=&locationId=undefined&libraryId=";
      expect(component.qrCode).toBe(equalTo);
    });
  });

  describe('describe copyLink', () => {
    it('should call copyLink', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      const inputParam = { firstChild: { textContent: 'http://dev2photontest007.axis360dev1.baker-taylor.com?partnerId=335&locationId=165&libraryId=2E866491-92E1-EC11-B656-2818784DEE81 ' } }
      component.copyLink(inputParam);
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith("SUCCESS", "Copied to Clipboard");
    });
  });
});
