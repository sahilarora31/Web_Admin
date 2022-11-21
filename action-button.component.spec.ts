import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AgGridModule } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { PartnerManagementService } from '../../service/partner-management.service';
import { ActionButtonComponent } from './action-button.component';

describe('ActionButtonComponent', () => {
  let component;
  let fixture;
  let params;
  let service;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AgGridModule,
        RouterTestingModule,
        HttpClientTestingModule,
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ActionButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActionButtonComponent);
    component = fixture.componentInstance;
    service = TestBed.inject(PartnerManagementService);
    service.isPartnerGrid = true;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call agInit method', () => {
    spyOn(component, 'agInit').and.callThrough();
    component.agInit(params);
    expect(component.agInit).toHaveBeenCalled();
  });

  it('should call invokeGridAction method', () => {
    spyOn(component, 'invokeGridAction').and.callThrough();
    component.agInit(params);
    component.invokeGridAction('EDIT');
    expect(component.invokeGridAction).toHaveBeenCalled();
  });

});
