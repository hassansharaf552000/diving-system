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

export interface EntryTransaction {
  entryTransactionId?: number;
  voucherNumber?: string;
  transactionDate?: string;
  
  repId?: number;
  repName?: string;
  agentId?: number;
  agentName?: string;
  nationalityId?: number;
  nationalityName?: string;
  
  hotelId?: number;
  hotelName?: string;
  roomNumber?: string;
  pickUpTime?: string;
  hotelDestinationId?: number;
  hotelDestinationName?: string;
  
  excursionId?: number;
  excursionName?: string;
  excursionSupplierId?: number;
  excursionSupplierName?: string;
  
  priceListId?: number;
  priceListName?: string;
  paymentType?: string;
  
  adl?: number;
  chd?: number;
  inf?: number;
  
  note?: string;
  
  // Revenue
  revenueDate?: string;
  revenueRecNo?: string;
  revenueEGP?: number;
  revenueUSD?: number;
  revenueEUR?: number;
  revenueGBP?: number;
  revenueFree?: boolean;
  
  // Refund
  refundDate?: string;
  refundRecNo?: string;
  refundEGP?: number;
  refundUSD?: number;
  refundEUR?: number;
  refundGBP?: number;
  refundFree?: boolean;
  
  // Discount
  discountEGP?: number;
  discountUSD?: number;
  discountEUR?: number;
  discountGBP?: number;
  discountFree?: boolean;
  
  // Selling
  sellingEGP?: number;
  sellingUSD?: number;
  sellingEUR?: number;
  sellingGBP?: number;
  sellingFree?: boolean;
  
  // Cost
  costEGP?: number;
  costUSD?: number;
  costEUR?: number;
  costGBP?: number;
  costFree?: boolean;
  
  active?: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeDefinition {
  key: string;
  displayName: string;
}

export interface OperationAccount {
  id: number;
  accountNumber: string;
  accountName: string;
  parentId: number | null;
  parentAccountNumber?: string | null;
  parentAccountName?: string | null;
  level: number;
  isActive: boolean;
  children?: OperationAccount[];
  hasChildren?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string | null;
  updatedBy?: string | null;
  // UI state
  expanded?: boolean;
  childrenLoaded?: boolean;
}

export interface OperationAccountCreate {
  accountNumber: string;
  accountName: string;
  parentId: number | null;
  isActive: boolean;
  createdBy: string;
}

export interface CodePeriod {
  periodId?: number;
  periodName: string;
  active: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeBeneficiaryName {
  beneficiaryId?: number;
  beneficiaryName: string;
  beneficiaryTypeId?: number;
  beneficiaryTypeName?: string;
  commercialName?: string;
  vatNo?: string;
  fileNo?: string;
  address?: string;
  phone?: string;
  active: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeBeneficiaryType {
  beneficiaryTypeId?: number;
  beneficiaryTypeName: string;
  active: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeCostCenter {
  costCenterId?: number;
  costCenterNumber: string;
  costCenterName: string;
  costCenterGroup: string;
  active: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeFileNumber {
  fileId?: number;
  fileNumber: string;
  fileName: string;
  agentId?: number;
  agentName?: string;
  periodId?: number;
  periodName?: string;
  active: boolean;
  recordBy?: string;
  recordTime?: string;
}

export interface CodeAgent {
  agentId?: number;
  agentName: string;
  active: boolean;
  recordBy?: string;
  recordTime?: string;
}

// ========== TREASURY TRANSACTIONS ==========

export interface TreasuryTransactionLine {
  treasuryTransactionLineId?: number;
  treasuryTransactionId?: number;
  accountId?: number;
  accountName?: string;
  fileNumberId?: number;
  fileNumberValue?: string;
  serviceId?: number;
  costCenterId?: number;
  costCenterName?: string;
  periodId?: number;
  periodName?: string;
  taxPercent?: number;
  taxNo?: string;
  lineDescription?: string;
  debit: number;
  credit: number;
  eqDebit: number;
  eqCredit: number;
}

export interface TreasuryTransaction {
  treasuryTransactionId?: number;
  transactionTypeId?: number;
  transactionTypeName?: string;
  receiptNo?: string;
  transactionDate?: string;
  periodId?: number;
  periodName?: string;
  beneficiaryNameId?: number;
  beneficiaryNameValue?: string;
  beneficiaryTypeId?: number;
  beneficiaryTypeName?: string;
  currency?: string;
  rate?: number;
  dueDate?: string;
  withdrawBank?: string;
  paymentType?: string;
  paymentDefaultAccountId?: number;
  paymentDefaultAccountName?: string;
  description?: string;
  active?: boolean;
  recordBy?: string;
  recordTime?: string;
  luRecordBy?: string;
  luRecordTime?: string;
  lines?: TreasuryTransactionLine[];
}

export interface TreasuryTransactionCreate {
  transactionTypeId: number;
  receiptNo: string;
  transactionDate: string;
  periodId: number;
  beneficiaryNameId?: number;
  beneficiaryTypeId?: number;
  currency: string;
  rate: number;
  dueDate?: string;
  withdrawBank?: string;
  paymentType: string;
  paymentDefaultAccountId: number;
  description?: string;
  recordBy: string;
  manualLineAccountId?: number;
  manualLineFileNumberId?: number;
  manualLineCostCenterId?: number;
  manualLinePeriodId?: number;
  manualLineServiceId?: number;
  manualLineTaxPercent?: number;
  manualLineTaxNo?: string;
  manualLineDescription?: string;
  manualLineDebit?: number;
  manualLineCredit?: number;
}

// ========== TREASURY COUNTERS ==========

export interface TreasuryCounterLine {
  treasuryCounterLineId?: number;
  denomination: number;
  count: number;
  lineTotal?: number;
}

export interface TreasuryCounter {
  treasuryCounterId?: number;
  counterDate?: string;
  branchName?: string;
  currency?: string;
  totalCounter?: number;
  treasuryBalance?: number;
  difference?: number;
  recordBy?: string;
  recordTime?: string;
  luRecordBy?: string;
  luRecordTime?: string;
  lines?: TreasuryCounterLine[];
}

export interface TreasuryCounterCreate {
  counterDate: string;
  branchName?: string;
  currency: string;
  lines: { denomination: number; count: number }[];
  recordBy?: string;
}
