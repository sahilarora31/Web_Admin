import { TestBed } from '@angular/core/testing';
import { PartnerManagementComponent } from './partner-management.component';
import { AgGridModule } from 'ag-grid-angular';
import { ActionButtonComponent } from './shared/component/action-button/action-button.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, } from '@angular/material/dialog';
import { of } from 'rxjs';
import { SpinnerService } from '@shared/services/spinner.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DeletePopupComponent } from './shared/component/delete-popup/delete-popup.component';

describe('PartnerManagementComponent', () => {
  let component;
  let fixture;
  let router;
  let spinnerService;
  const dialogRefStub = {
    afterClosed() {
      return of('YES');
    }
  };

  const dialogStub = { open: () => dialogRefStub };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        AgGridModule,
        RouterTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [
        SpinnerService,
        { provide: MatDialog, useValue: dialogStub },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
      declarations: [ PartnerManagementComponent, ActionButtonComponent, DeletePopupComponent ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(PartnerManagementComponent);
    component = fixture.componentInstance;
    spinnerService = TestBed.inject(SpinnerService);
    router = TestBed.inject(Router);
    fixture.detectChanges();

  });

  it('should create', () => {
    component.frameworkComponents = {
      btnCellRenderer: ActionButtonComponent
    };
    expect(component).toBeTruthy();
  });

  it('getPartnerList', () => {
    const response = [{
      ContactEmail: 'loi.cao@bt.com',
      ContactName: 'Loi',
      ContactPhone: '555-555-5555',
      EPopupLibraryID: 'B95233F9-6C12-EA11-828B-0003FFE68A97',
      EPopupLibraryPrefix: 'loiqa1',
      EPopupLibraryUrl: 'http://loiqa1.axis360dev2.baker-taylor.com',
      ExtensionData: [],
      IsActive: true,
      PartnerID: 1,
      PartnerName: 'Partner 1'
  }];
    spyOn(spinnerService, 'withObservable').and.returnValue(of(response));
    component.getPartnerList();
    const cellRenderer = component.columns.find(c => c.field === 'EPopupLibraryUrl').cellRenderer as any;
    expect(component.rowData.length).toBeGreaterThan(0);
    expect(spinnerService.withObservable).toHaveBeenCalled();
    expect(cellRenderer({libraryUrl: { value: '<a target="_blank" href="${value}">${value}</a>' }})).toContain('<a target="_blank" href=');
  });

  describe('Grid action button - ', () => {
    it('call saveLocation method - EDIT', () => {
      spyOn(component, 'addNewPartner').and.callThrough();
      const data: any = {
        Action: 'EDIT',
        Row: '1',
        Col: { 'PartnerId': '0'}
      };
      component.saveLocation(data);
      expect(component.addNewPartner).toHaveBeenCalled();
    });

    it('call saveLocation method - DELETE', () => {
      spyOn(component, 'saveLocation').and.callThrough();
      const data: any = {
        'Action': 'DELETE',
        'Row': '1',
        'Col': { 'PartnerId': '0'}
      };
      component.saveLocation(data);
      expect(component.saveLocation).toHaveBeenCalled();
    });
  });

  it('deletePartner', () => {
    const response = true;
    const partnerId = '0';
    spyOn(spinnerService, 'withObservable').and.returnValue(of(response));
    component.deletePartner(partnerId);
    expect(component.deleteResponse).toBeTrue();
    expect(spinnerService.withObservable).toHaveBeenCalled();
  });

  describe('navigate create/edit partner', () => {
    it('navigate to create partner', () => {
      const navigateSpy = spyOn(router,'navigateByUrl');
      component.addNewPartner(true);
      expect(navigateSpy).toHaveBeenCalledWith('partnermanagement/create-partner-management');
    });

    it('navigate to edit partner', () => {
      const navigateSpy = spyOn(router,'navigateByUrl');
      component.addNewPartner(false, 0);
      expect(navigateSpy).toHaveBeenCalledWith('partnermanagement/edit-partner-management/0');
    });

  });
});
