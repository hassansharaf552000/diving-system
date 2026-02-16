export interface Agent {
  id?: number;
  agentCode?: string;
  agentName: string;
  nationality?: string;
  vatNo?: string;
  fileNo?: string;
  email?: string;
  address?: string;
  phone?: string;
  recordBy?: string;
  recordTime?: string;
}

export interface Boat {
  id?: number;
  boatName: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface Excursion {
  id?: number;
  excursionName: string;
  supplierId?: number;
  supplierName?: string;       // populated by GET response
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface ExcursionSupplier {
  id?: number;
  supplierName: string;
  vatNo?: string;
  fileNo?: string;
  email?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface Guide {
  id?: number;
  guideName: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface HotelDestination {
  id?: number;
  destinationName: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface Hotel {
  id?: number;
  hotelName: string;
  destinationId?: number;
  destinationName?: string;    // populated by GET response
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface Nationality {
  id?: number;
  nationalityName: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface PriceList {
  id?: number;
  priceListName: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface Rate {
  id?: number;
  fromDate?: string;
  toDate?: string;
  currency?: string;
  rateValue?: number;
  recordBy?: string;
  recordTime?: string;
}

export interface Rep {
  id?: number;
  repName: string;
  agentId?: number;
  agentName?: string;          // populated by GET response
  address?: string;
  phone?: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface TransportationType {
  id?: number;
  typeName: string;
  supplierId?: number;
  supplierName?: string;       // populated by GET response
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface TransportationSupplier {
  id?: number;
  supplierName: string;
  vatNo?: string;
  fileNo?: string;
  email?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface TransportationCost {
  id?: number;
  supplierId?: number;
  supplierName?: string;       // populated by GET response
  carTypeId?: number;
  carTypeName?: string;        // populated by GET response
  destinationId?: number;
  destinationName?: string;    // populated by GET response
  roundType?: string;
  costEGP?: number;
  recordBy?: string;
  recordTime?: string;
}

export interface Voucher {
  id?: number;
  repId?: number;
  repName?: string;            // populated by GET response
  fromNumber?: number;
  toNumber?: number;
  recordBy?: string;
  recordTime?: string;
}

export interface ExcursionCostSelling {
  id?: number;
  priceListId?: number;
  priceListName?: string;        // populated by GET response
  excursionId?: number;
  excursionName?: string;        // populated by GET response
  destinationId?: number;
  destinationName?: string;      // populated by GET response
  agentId?: number;
  agentName?: string;            // populated by GET response
  supplierId?: number;
  supplierName?: string;         // populated by GET response
  sellingAdlEGP?: number;
  sellingAdlUSD?: number;
  sellingAdlEUR?: number;
  sellingAdlGBP?: number;
  sellingChdEGP?: number;
  sellingChdUSD?: number;
  sellingChdEUR?: number;
  sellingChdGBP?: number;
  costAdlEGP?: number;
  costAdlUSD?: number;
  costAdlEUR?: number;
  costAdlGBP?: number;
  costChdEGP?: number;
  costChdUSD?: number;
  costChdEUR?: number;
  costChdGBP?: number;
  nationalFeeAdlEGP?: number;
  nationalFeeAdlUSD?: number;
  nationalFeeChdEGP?: number;
  nationalFeeChdUSD?: number;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeDefinition {
  key: string;
  displayName: string;
}
