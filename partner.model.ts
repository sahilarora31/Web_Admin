export interface Partner {
    partnerID: string;
    partnerName?: string;
    ePopupLibraryID?: string;
    contactName?: string;
    contactEmail?: string;
    contactPhone?: string;
    isActive?: string;
    locations?: any[]
}

export interface PartnerLocation {
    locationID?: number;
    locationName?: string;
    partnerID?: number;
    partnerName?: string;
    partnerSiteEnabled?: boolean;
    libraryID?: string;
    libraryName?: string;
    libraryUrl?: string;
    disableTempPatronDays?: number;
}

export class Location{
    actionType?:string;
    action?:string;
    locationId?:string;
    locationName?: string;
    streetAddress1?:string;
    streetAddress2?:string;
    city?:string;
    state?:State;
    zipPostalCode?:string;
    country?:Country;
}

export class CreatePartnerLocation{
    partnerId?:string;
    locationId?:string;
    locationName?: string;
    streetAddress1?:string;
    streetAddress2?:string;
    city?:string;
    state?:string;
    zipPostalCode?:string;
    country?:string;
}

export class State{
    key:string;
    value:string;
}

export class Country{
    key:string;
    value:string;
}
