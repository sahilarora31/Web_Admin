import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActionButtonComponent } from '../shared/component/action-button/action-button.component';
import { of } from 'rxjs';
import { CreatePartnerManagementComponent } from './create-partner-management.component';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { SpinnerService } from '@shared/services/spinner.service';
import { PartnerManagementService } from '../shared/service/partner-management.service';
import { ToastMessageService } from '@shared/services/toast-message.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';

describe('CreatePartnerManagementComponent', () => {
  let component: CreatePartnerManagementComponent;
  let fixture: ComponentFixture<CreatePartnerManagementComponent>;
  let router: Router;
  let partnerManagementService: PartnerManagementService;
  let toastMessageService: ToastMessageService;
  const dialogRefStub = {
    afterClosed() {
      return of('YES');
    }
  };
  let data = [{
    PartnerName: "partnerName",
    EPopupLibraryID: "1234",
    EPopupLibraryUrl: "http://demo.axis360dev2.baker-taylor.com",
    ContactName: "Ram",
    ContactEmail: "s@s.com",
    ContactPhone: "1234567890"
  }];
  const dialogStub = { open: () => dialogRefStub };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        MatSnackBarModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatExpansionModule,
        BrowserAnimationsModule
      ],
      declarations: [CreatePartnerManagementComponent, ActionButtonComponent],
      providers: [
        { provide: MatDialog, useValue: dialogStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        FormBuilder,
        SpinnerService,
        ToastMessageService,
        PartnerManagementService
      ]
    }).compileComponents();
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePartnerManagementComponent);
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
    component.panelPartnerState = true;
    component.panelLocationState = true;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('describe addPartner', () => {
    it('call addPartner method', () => {
      component.createPartnerForm.controls.ePopupLibraryID.setValue('ePopupLibraryID');
      component.createPartnerForm.controls.partnerName.setValue('partnerName');
      component.createPartnerForm.controls.contactEmail.setValue('contactEmail@photon.com');
      component.createPartnerForm.controls.contactName.setValue('contactName');
      component.createPartnerForm.controls.contactPhone.setValue('222-222-2222');
      spyOn(partnerManagementService, 'getPartnerList').and.returnValue(of(data));
      spyOn(partnerManagementService, 'addPartner').and.returnValue(of(true));
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.addPartner();
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith("ERROR", "Partner Name should be unique.");
    });

    it('call addPartner method with invalid input', () => {
      component.addPartner();
      expect(component.addPartner).toBeTruthy();
    });

    it('call addPartner method with empty locations', () => {
      component.createPartnerForm.controls.ePopupLibraryID.setValue('ePopupLibraryID');
      component.createPartnerForm.controls.partnerName.setValue('Default Partner');
      component.createPartnerForm.controls.contactEmail.setValue('contactEmail@photon.com');
      component.createPartnerForm.controls.contactName.setValue('contactName');
      component.createPartnerForm.controls.contactPhone.setValue('222-222-2222');
      component.rowData = [];
      spyOn(partnerManagementService, 'getPartnerList').and.returnValue(of(data));
      spyOn(partnerManagementService, 'addPartner').and.returnValue(of(true));
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.addPartner();
      expect(toastMessageService.showSnackBar).toHaveBeenCalledWith("SUCCESS", "Successfully Saved");
    });
  });

  describe('describe saveLocation', () => {
    it('call saveLocation EDIT method', () => {
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
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

    it('call saveLocation NewLocation method', () => {
      const data: any = { Action: "EDIT" };
      let partnerLocation = {
        actionType: "NEW",
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
      component.saveLocation(data);
      expect(component.matDialog).toBeDefined();
    });

    it('call saveLocation DELETE method', () => {
      component.rowData[0].action = "DELETE";
      const data: any = { Col: { action: "DELETE" } };
      let partnerLocation = {
        actionType: "DELETE",
        action: "DELETE",
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
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.saveLocation(data);
      expect(component.matDialog).toBeDefined();
    });
  });

  describe('describe addNewLocation', () => {
    it('call addNewLocation method', () => {
      component.rowData[0].action = "CREATE";
      const data: any = { Col: { action: "CREATE" } };
      let partnerLocation = {
        actionType: "CREATE",
        action: "CREATE",
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
      spyOn(toastMessageService, 'showSnackBar').and.callThrough();
      component.createPartnerForm.controls.contactPhone.setValue('contactPhone');
      component.addNewLocation(true);
      expect(component.matDialog).toBeDefined();
    });
  });

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

  it('call getLibraryPrefixInfo method', () => {
    const data = [
      { LibraryID: "1", LibraryPrefix: "propse", LibraryName: "Hett" },
      { LibraryID: "2", LibraryPrefix: "errose", LibraryName: "Heter" }]
    spyOn(partnerManagementService, 'getLibraryPrefixInfo').and.returnValue(of(data));
    component.getLibraryPrefixInfo();
    expect(component.getLibraryPrefixInfo).toBeTruthy();
  });

  describe('describe displayHeaderName', () => {
    it('call displayHeaderName method', () => {
      component.createPartnerForm.controls.partnerName.setValue('Default Partner');
      component.displayHeaderName();
      expect(component.createPartnerForm.get('partnerName').value).toEqual('Default Partner');
    });
    it('call displayHeaderName method When empty partner name', () => {
      component.createPartnerForm.controls.partnerName.setValue('');
      component.displayHeaderName();
      expect(component.createPartnerForm.get('partnerName').value).toEqual('');
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
