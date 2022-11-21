import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_INFO } from '@shared/constants/api.constants';
import { Observable } from 'rxjs';
import { Partner, CreatePartnerLocation } from '../model/partner.model';
import _ from 'lodash';

@Injectable({
  providedIn: 'root',
})
export class PartnerManagementService {
  public isLocationsGrid = false;
  public showQRCodePopup = false;
  public defaultPartnerNameCount: number;
  public popup = {
    header: '',
    body_content1: '',
    body_content2: '',
    cancelButtonText: '',
    submitButtonText: ''
  }
  constructor(private http: HttpClient) {

  }

  getPartnerList(partnerId: string): Observable<any> {
    return this.http.get<any>(
      API_INFO.getPartnerInfo.replace('<partnerId>', partnerId));
  }

  getLocationsList(partnerId: string): Observable<any> {
    return this.http.get<any>(
      API_INFO.getAllLocations.replace('<partnerId>', partnerId));
  }

  addPartner(partner: any): Observable<any> {
    return this.http.post<any>(API_INFO.addPartner, partner);
  }

  updatePartner(partner: any): Observable<any> {
    return this.http.put<any>(API_INFO.updatePartner, partner);
  }

  getLibraryPrefixInfo(): Observable<any> {
    return this.http.get<any>(API_INFO.getLibraryPrefixInfo);
  }

  deletePartner(partnerId: string): Observable<any> {
    return this.http.delete(
      API_INFO.deletePartner.replace('<partnerId>', partnerId));
  }

  getCountriesList(): Observable<any> {
    return this.http.get<any>(
      API_INFO.getCountries);
  }

  getStatesList(): Observable<any> {
    return this.http.get<any>(
      API_INFO.getStates);
  }

  getEpopupSiteUrl(): Observable<any> {
    return this.http.get<any>(
      API_INFO.getEpopupSiteUrl);
  }


  createPartnerLocation(partnerLocation: CreatePartnerLocation): Observable<any> {
    return this.http.post(API_INFO.createPartnerLocation, partnerLocation);
  }

  editPartnerLocation(partnerLocation: CreatePartnerLocation): Observable<any> {
    return this.http.put(API_INFO.editPartnerLocation, partnerLocation);
  }

  deletePartnerLocation(locationID: string): Observable<any> {
    return this.http.delete(API_INFO.deletePartnerLocation.replace('<locationID>', locationID));
  }

  createDefaultNames(rowData: any, searchText: string, screenName: string): string {
    if (screenName === 'partner') {
      let result = rowData.filter((x: { PartnerName: string; }) => x.PartnerName.toLowerCase().includes(searchText)).map(({ PartnerName }) => ({ PartnerName }));
      let count = result.map((x: { PartnerName: string; }) => Number(x.PartnerName.substring(16))).sort((a, b) => (a > b ? 1 : -1)).at(-1);
      return "Default Partner " + ((count ? count : 0) + 1);
    } else if (screenName === 'location') {
      let result = rowData.filter((x: { locationName: string; }) => x.locationName.toLowerCase().includes(searchText)).map(({ locationName }) => ({ locationName }));
      let count = result.map((x: { locationName: string; }) => Number(x.locationName.substring(17))).sort((a, b) => (a > b ? 1 : -1)).at(-1);
      return "Default Location " + ((count ? count : 0) + 1);
    }
  }

  removeDisableAttribute() {
    const btn = document.getElementById('btnSavePartner');
    btn.removeAttribute('disabled');
  }

  setDisableAttribute() {
    const btn = document.getElementById('btnSavePartner');
    btn.setAttribute('disabled', 'disabled');
  }
}
