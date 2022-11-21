import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed, inject } from '@angular/core/testing';
import { Component } from 'ag-grid-community';
import { of as observableOf } from 'rxjs';
import { CreatePartnerLocation, Partner } from '../model/partner.model';
import { PartnerManagementService } from './partner-management.service';

describe('ConfigService', () => {
  let httpClient: HttpClient;
  let partnerManagementServie: PartnerManagementService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PartnerManagementService],
    });
    httpClient = TestBed.inject(HttpClient);
    partnerManagementServie = new PartnerManagementService(httpClient);
  });

  it('should be created', inject([PartnerManagementService], (service: PartnerManagementService) => {
    expect(service).toBeTruthy();
  }));

  describe('describe getLocationsList', () => {
    it('should call getLocationsList', () => {
      spyOn(httpClient, 'get').and.returnValue(observableOf());
      partnerManagementServie.getLocationsList('354');
      expect(httpClient.get).toHaveBeenCalledWith('/PartnerManagement/GetAllLocations?partnerId=354');
    });
  });

  describe('describe addPartner', () => {
    it('should call addPartner', () => {
      const PartnerData: Partner = {
        partnerID: '354',
        partnerName: 'partnerNameTest 324',
        ePopupLibraryID: '457AEC23-5FE6-EC11-B656-2818784DEE81',
        contactName: 'ContactNameTest',
        contactEmail: 'ContactEmail@Test.com',
        contactPhone: '555-555-5555',
        locations: [
          {
            "action": 1,
            "locationName": "Location 1",
            "streetAddress1": "Street 1",
            "streetAddress2": "Street 2",
            "city": "New Jerssey",
            "state": "Texas",
            "stateKey": "Texas",
            "zipPostalCode": 20026,
            "country": "United States of America",
            "countryKey": "US"
          }
        ]
      };
      spyOn(httpClient, 'post').and.returnValue(observableOf());
      partnerManagementServie.addPartner(PartnerData);
      expect(httpClient.post).toHaveBeenCalled();
    });
  });
  describe('describe updatePartner', () => {
    it('should call updatePartner', () => {
      const PartnerData: Partner = {
        partnerID: '369',
        partnerName: 'partnerNameTest 324',
        ePopupLibraryID: '74A979CC-AADD-EC11-B656-2818784DEE81',
        contactName: '555-555-5555',
        contactEmail: 'ContactEmail@Test.com',
        contactPhone: '555-555-5555',
      };
      spyOn(httpClient, 'put').and.returnValue(observableOf());
      partnerManagementServie.updatePartner(PartnerData);
      expect(httpClient.put).toHaveBeenCalled();
    });
  });
  describe('describe getStatesList', () => {
    it('should call getStatesList', () => {
      spyOn(httpClient, 'get').and.returnValue(observableOf());
      partnerManagementServie.getStatesList();
      expect(httpClient.get).toHaveBeenCalledWith('/PartnerManagement/GetStates');
    });
  });
  describe('describe getEpopupSiteUrl', () => {
    it('should call getEpopupSiteUrl', () => {
      spyOn(httpClient, 'get').and.returnValue(observableOf());
      partnerManagementServie.getEpopupSiteUrl();
      expect(httpClient.get).toHaveBeenCalledWith('/PartnerManagement/GetEpopupSiteUrl');
    });
  });
  describe('describe createPartnerLocation', () => {
    it('should call createPartnerLocation', () => {
      const PartnerLocationData: CreatePartnerLocation = {
        partnerId: '369',
        locationName: 'Location Name 1',
        city: 'Florida',
        country: 'United States of America',
        state: 'Florida',
        streetAddress1: 'Street 1',
        streetAddress2: 'Street 2',
        zipPostalCode: '500002'
      }
      spyOn(httpClient, 'post').and.returnValue(observableOf());
      partnerManagementServie.createPartnerLocation(PartnerLocationData);
      expect(httpClient.post).toHaveBeenCalled();
    });
  });
  describe('describe deletePartnerLocation', () => {
    it('should call deletePartnerLocation', () => {
      spyOn(httpClient, 'delete').and.returnValue(observableOf());
      partnerManagementServie.deletePartnerLocation('196');
      expect(httpClient.delete).toHaveBeenCalledWith('/PartnerManagement/DeletePartnerLocation?locationID=196');
    });
  });
  describe('describe createDefaultNames', () => {
    it('should call createDefaultNames', () => {
      let rowData = [{PartnerName:"partner"}];
      partnerManagementServie.createDefaultNames(rowData, "partner", "partner");
      expect(rowData.length).toEqual(1);
    });
    it('should call createDefaultNames with CREATE option', () => {
      let rowData = [{locationName:"partner"}];
      partnerManagementServie.createDefaultNames(rowData, "partner", "CREATE");
      expect(rowData.length).toEqual(1);
    });
  });
});
