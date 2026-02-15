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
  capacity?: number;
  status?: string;
  recordBy?: string;
  recordTime?: string;
}

export interface Excursion {
  id?: number;
  excursionName: string;
  supplierId?: number;
  supplierName?: string;       // populated by GET response
  recordBy?: string;
  recordTime?: string;
}

export interface ExcursionSupplier {
  id?: number;
  supplierName: string;
  recordBy?: string;
  recordTime?: string;
}

export interface Guide {
  id?: number;
  guideName: string;
  address?: string;
  phone?: string;
  recordBy?: string;
  recordTime?: string;
}

export interface HotelDestination {
  id?: number;
  destinationName: string;
  recordBy?: string;
  recordTime?: string;
}

export interface Hotel {
  id?: number;
  hotelName: string;
  destinationId?: number;
  destinationName?: string;    // populated by GET response
  recordBy?: string;
  recordTime?: string;
}

export interface Nationality {
  id?: number;
  nationalityName: string;
  recordBy?: string;
  recordTime?: string;
}

export interface PriceList {
  id?: number;
  priceListName: string;
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
  recordBy?: string;
  recordTime?: string;
}

export interface TransportationType {
  id?: number;
  typeName: string;
  supplierId?: number;
  supplierName?: string;       // populated by GET response
  recordBy?: string;
  recordTime?: string;
}

export interface TransportationSupplier {
  id?: number;
  supplierName: string;
  recordBy?: string;
  recordTime?: string;
}

export interface TransportationCost {
  id?: number;
  typeId?: number;
  typeName?: string;           // populated by GET response
  costValue?: number;
  currency?: string;
  fromDate?: string;
  toDate?: string;
  recordBy?: string;
  recordTime?: string;
}

export interface Voucher {
  id?: number;
  voucherFrom?: string;
  voucherTo?: string;
  voucherCount?: number;
  repId?: number;
  repName?: string;            // populated by GET response
  recordBy?: string;
  recordTime?: string;
}
