import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { noop, of } from 'rxjs';
import { PartnerManagementService } from '../../service/partner-management.service';

import { DeletePopupComponent } from './delete-popup.component';

describe('DeletePopupComponent', () => {
  let component: DeletePopupComponent;
  let fixture: ComponentFixture<DeletePopupComponent>;
  let partnerService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        HttpClientTestingModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: {} },
        { provide: MatDialogRef,    useValue: {
          backdropClick: () => of(),
          afterOpened: () => of(),
          afterClosed: () => of(),
          close: noop,
        }, }
      ],
      declarations: [ DeletePopupComponent ]
    })
    .compileComponents();
    partnerService = TestBed.inject(PartnerManagementService);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeletePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call submitClick method', () => {
    spyOn(component, 'submitClick').and.callThrough();
    component.submitClick();
    expect(component.submitClick).toHaveBeenCalled();
  });

  it('should call cancelClick method', () => {
    spyOn(component, 'cancelClick').and.callThrough();
    component.cancelClick();
    expect(component.cancelClick).toHaveBeenCalled();
  });

});
