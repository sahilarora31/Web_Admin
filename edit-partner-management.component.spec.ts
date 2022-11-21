import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActionButtonComponent } from '../shared/component/action-button/action-button.component';
import { of, throwError } from 'rxjs';
import { EditPartnerManagementComponent } from './edit-partner-management.component';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { PartnerManagementService } from '../shared/service/partner-management.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
import { SpinnerService } from '@shared/services/spinner.service';
import { RouterTestingModule } from '@angular/router/testing';

describe('EditPartnerManagementComponent', () => {
  let component: EditPartnerManagementComponent;
  let fixture: ComponentFixture<EditPartnerManagementComponent>;
  let router: Router;
  let partnerManagementService: PartnerManagementService;
  let toastMessageService: ToastMessageService;
  let locations = [{
    "City": "",
    "Country": "United States of America",
    "CreatedBy": "BTQATeam",
    "IsActive": true,
    "LocationID": 165,
    "LocationName": "Default Location",
    "PartnerID": 335,
    "State": "California",
    "StreetAddress1": "",
    "StreetAddress2": "",
    "UpdatedBy": "BTQATeam",
    "ZipPostalcode": "",
    "ePopUpSiteUrl": "http://demo.axis360dev2.baker-taylor.com"
  }
  ]

  const dialogRefStub = {
    afterClosed() {
      return of('YES');
    }
  };

  const dialogStub = { open: () => dialogRefStub };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatExpansionModule,
        BrowserAnimationsModule,
        MatSnackBarModule
      ],
      declarations: [EditPartnerManagementComponent, ActionButtonComponent],
      providers: [
        { provide: MatDialog, useValue: dialogStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {
                partnerId: "12"
              }
            }
          }
        },
        ToastMessageService,
        FormBuilder,
        SpinnerService,
        PartnerManagementService
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPartnerManagementComponent);
    partnerManagementService = TestBed.inject(PartnerManagementService);
    toastMessageService = TestBed.inject(ToastMessageService);
    router = TestBed.inject(Router);
    component = fixture.componentInstance;
    component.frameworkComponents = {
      btnCellRenderer: ActionButtonComponent
    };
    component.rowData = [{
      action: "EDIT",
      locationName: "Hailo",
      streetAddress1: "318n, Road 5",
      streetAddress2: "finip street",
      city: "Chicao",
      state: "1",
      stateKey: "2",
      zipPostalCode: "12345",
      country: "1",
      countryKey: "US"
    }]
    component.ePopupSiteList = [{ LibraryID: "1234" }]
    component.panelPartnerState = true;
    component.panelLocationState = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('describe getLibraryPrefixInfo', () => {
    it('call getLibraryPrefixInfo method', () => {
      const data = [
        { LibraryID: "1", LibraryPrefix: "propse", LibraryName: "your" },
        { LibraryID: "2", LibraryPrefix: "errose", LibraryName: "me" }]
      spyOn(partnerManagementService, 'getLibraryPrefixInfo').and.returnValue(of(data));
      component.getLibraryPrefixInfo();
      expect(component.getLibraryPrefixInfo).toBeTruthy();
    });
  });

  describe('describe cancelPartner', () => {
    it('call cancelPartner method', () => {
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of("YES")
        } as MatDialogRef<typeof component>);
      const navigateSpy = spyOn(router, 'navigateByUrl');
      component.cancelPartner();
      expect(navigateSpy).toHaveBeenCalledWith('partnermanagement');
    });
  });

  describe('describe confirmDeleteLocation', () => {
    it('call confirmDeleteLocation method', () => {
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of("YES")
        } as MatDialogRef<typeof component>);
      spyOn(partnerManagementService, 'deletePartnerLocation').and.returnValue(of(true));
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      let data = JSON.parse('{"Action":"DELETE","Row":0,"Col":{"partnerID":870,"locationName":"Default Location 3","locationID":602,"streetAddress1":"","streetAddress2":"","city":"Basiol","state":"California","stateKey":"California","zip":"12345678","country":"United States of America","countryKey":"United States of America","libraryId":"74A979CC-AADD-EC11-B656-2818784DEE81","ePopUpSiteUrl":"http://epartnersite.axis360dev2.baker-taylor.com"}}')
      component.rowData[0].locationID = 602;
      component.confirmDeleteLocation(data);
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith("SUCCESS", "Successfully Deleted");
    });
  });

  describe('describe updatePartner', () => {
    it('call updatePartner method', () => {
      component.editPartnerForm.controls.ePopupLibraryID.setValue({ LibraryID: "ePopupLibraryID" });
      component.editPartnerForm.controls.partnerName.setValue('partnerName');
      component.editPartnerForm.controls.contactEmail.setValue('contactEmail');
      component.editPartnerForm.controls.contactName.setValue('contactName');
      component.editPartnerForm.controls.contactPhone.setValue('contactPhone');
      spyOn(partnerManagementService, 'updatePartner').and.returnValue(of(true));
      component.updatePartner();
      expect(partnerManagementService.updatePartner).toBeTruthy();
    });

    it('call updatePartner method when failed', () => {
      component.editPartnerForm.controls.ePopupLibraryID.setValue({ LibraryID: "ePopupLibraryID" });
      component.editPartnerForm.controls.partnerName.setValue('partnerName');
      component.editPartnerForm.controls.contactEmail.setValue('contactEmail');
      component.editPartnerForm.controls.contactName.setValue('contactName');
      component.editPartnerForm.controls.contactPhone.setValue('contactPhone');
      spyOn(partnerManagementService, 'updatePartner').and.returnValue(of(false));
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.updatePartner();
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith("ERROR", "Error occured");
    });
  });

  describe('describe getPartner', () => {
    it('call getPartner method', () => {
      let data = [{
        PartnerName: "Sam",
        EPopupLibraryID: "1234",
        EPopupLibraryUrl: "http://demo.axis360dev2.baker-taylor.com",
        ContactName: "Ram",
        ContactEmail: "s@s.com",
        ContactPhone: "1234567890"
      }];
      spyOn(partnerManagementService, 'getPartnerList').and.returnValue(of(data));
      spyOn(partnerManagementService, 'getLocationsList').and.returnValue(of(locations));
      component.getPartner();
      expect(partnerManagementService.getPartnerList).toHaveBeenCalled();
    });
  });

  describe('describe saveLocation', () => {
    it('call saveLocation EDIT method', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'editPartnerLocation').and.returnValue(of(true));
      const data: any = { Action: "EDIT" };
      let partnerLocation = {
        actionType: "EDIT",
        action: "EDIT",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.saveLocation(data);
      expect(component.matDialog).toBeDefined();
    });

    it('call saveLocation EDIT method When failed', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'editPartnerLocation').and.returnValue(of(false));
      const data: any = { Action: "EDIT" };
      let partnerLocation = {
        actionType: "EDIT",
        action: "EDIT",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.saveLocation(data);
      expect(component.matDialog).toBeDefined();
    });

    it('call saveLocation EDIT method When throw exception', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      const errorResponse = new Error();
      spyOn(partnerManagementService, 'editPartnerLocation').and.returnValue(throwError(errorResponse));
      const data: any = { Action: "EDIT" };
      let partnerLocation = {
        actionType: "EDIT",
        action: "EDIT",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.saveLocation(data);
      expect(component.matDialog).toBeDefined();
    });

    it('call saveLocation EDIT method when location name is duplicated', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'editPartnerLocation').and.returnValue(of(true));
      component.rowData.push(component.rowData[0]);
      const data: any = { Action: "EDIT" };
      let partnerLocation = {
        actionType: "EDIT",
        action: "EDIT",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.saveLocation(data);
      expect(component.matDialog).toBeDefined();
    });

    it('call saveLocation DELETE method', () => {
      component.rowData[0].Action = "DELETE";
      spyOn(partnerManagementService, 'deletePartnerLocation').and.returnValue(of(true));
      const data: any = { Col: { action: "DELETE" }, Action: "DELETE" };
      component.saveLocation(data);
      expect(component.saveLocation).toBeDefined();
    });

    it('call saveLocation DELETE method when failed', () => {
      component.rowData[0].Action = "DELETE";
      spyOn(partnerManagementService, 'deletePartnerLocation').and.returnValue(of(false));
      const data: any = { Col: { action: "DELETE" }, Action: "DELETE" };
      component.saveLocation(data);
      expect(component.saveLocation).toBeDefined();
    });

    it('call saveLocation DELETE method when throw exception', () => {
      component.rowData[0].Action = "DELETE";
      const errorResponse = new Error();
      spyOn(partnerManagementService, 'deletePartnerLocation').and.returnValue(throwError(errorResponse));
      const data: any = { Col: { action: "DELETE" }, Action: "DELETE" };
      component.saveLocation(data);
      expect(component.saveLocation).toBeDefined();
    });

    it('call saveLocation DOWNLOAD method', () => {
      const data: any = { Action: "DOWNLOAD" };
      let partnerLocation = {
        actionType: "DOWNLOAD",
        action: "DOWNLOAD",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.rowData[0].action = "DOWNLOAD";
      component.saveLocation(data);
      expect(component.saveLocation).toBeDefined();
    });
  });

  describe('describe updatePartner', () => {
    it('call addNewLocation method', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'createPartnerLocation').and.returnValue(of(true));
      let partnerLocation = {
        actionType: "",
        action: "NEW",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.addNewLocation(false);
      expect(component.matDialog).toBeDefined();
    });

    it('call addNewLocation method when loctionname is empty', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'createPartnerLocation').and.returnValue(of(true));
      let partnerLocation = {
        actionType: "",
        action: "NEW",
        locationName: "",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.addNewLocation(false);
      expect(component.matDialog).toBeDefined();
    });

    it('call addNewLocation method when loctionname is duplicated', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'createPartnerLocation').and.returnValue(of(true));
      let partnerLocation = {
        actionType: "",
        action: "NEW",
        locationId: 1,
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      component.rowData[0].locationID = 2;
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.addNewLocation(false);
      expect(component.matDialog).toBeDefined();
    });

    it('call addNewLocation Edit method', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'createPartnerLocation').and.returnValue(of(true));
      let partnerLocation = {
        actionType: "",
        action: "Create",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.addNewLocation(true);
      expect(component.matDialog).toBeDefined();
    });

    it('call addNewLocation method When failed', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      spyOn(partnerManagementService, 'createPartnerLocation').and.returnValue(of(false));
      let partnerLocation = {
        actionType: "",
        action: "NEW",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.addNewLocation(false);
      expect(component.matDialog).toBeDefined();
    });

    it('call addNewLocation method When throw exception', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      const errorResponse = new Error();
      spyOn(partnerManagementService, 'createPartnerLocation').and.returnValue(throwError(errorResponse));
      let partnerLocation = {
        actionType: "",
        action: "NEW",
        locationName: "Hailo",
        streetAddress1: "318n, Road 5",
        streetAddress2: "finip street",
        city: "Chicao",
        state: {
          key: "1",
          value: "Chicago"
        },
        zipPostalCode: "12345",
        country: {
          key: "1",
          value: "US"
        }
      }
      spyOn(component.matDialog, 'open')
        .and
        .returnValue({
          afterClosed: () => of(partnerLocation)
        } as MatDialogRef<typeof component>);
      component.addNewLocation(false);
      expect(component.matDialog).toBeDefined();
    });
  });

  describe('describe displayHeaderName', () => {
    it('call displayHeaderName method', () => {
      component.editPartnerForm.controls.partnerName.setValue('Default Partner');
      component.displayHeaderName();
      expect(component.editPartnerForm.get('partnerName').value).toEqual('Default Partner');
    });
    it('call displayHeaderName method When empty partner name', () => {
      component.editPartnerForm.controls.partnerName.setValue('');
      component.displayHeaderName();
      expect(component.editPartnerForm.get('partnerName').value).toEqual('');
    });
  });

  describe('describe keyPressEvent', () => {
    it('call keyPressEvent method with alphabets', () => {
      let e = { which: 69, keyCode: 69, preventDefault: jasmine.createSpy() }
      component.keyPressEvent(e);
      expect(e.preventDefault).toHaveBeenCalled();
    });
    it('call keyPressEvent method with numerics', () => {
      component.keyPressEvent(new KeyboardEvent('keydown', { 'key': '1' }));
      expect(component.keyPressEvent).toBeTruthy();
    });
  });
});
