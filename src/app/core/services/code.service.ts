import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Agent, Boat, Excursion, ExcursionSupplier, Guide,
  Hotel, HotelDestination, Nationality, PriceList, Rate,
  Rep, TransportationType, TransportationSupplier,
  TransportationCost, Voucher
} from '../interfaces/code.interfaces';

@Injectable({ providedIn: 'root' })
export class CodeService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // ========== AGENTS ==========
  getAgents(): Observable<Agent[]> { return this.http.get<Agent[]>(`${this.api}/api/Agents`); }
  getAgent(id: number): Observable<Agent> { return this.http.get<Agent>(`${this.api}/api/Agents/${id}`); }
  createAgent(data: Agent): Observable<Agent> { return this.http.post<Agent>(`${this.api}/api/Agents`, data); }
  updateAgent(id: number, data: Agent): Observable<Agent> { return this.http.put<Agent>(`${this.api}/api/Agents/${id}`, data); }
  deleteAgent(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Agents/${id}`); }

  // ========== BOATS ==========
  getBoats(): Observable<Boat[]> { return this.http.get<Boat[]>(`${this.api}/api/Boats`); }
  getBoat(id: number): Observable<Boat> { return this.http.get<Boat>(`${this.api}/api/Boats/${id}`); }
  createBoat(data: Boat): Observable<Boat> { return this.http.post<Boat>(`${this.api}/api/Boats`, data); }
  updateBoat(id: number, data: Boat): Observable<Boat> { return this.http.put<Boat>(`${this.api}/api/Boats/${id}`, data); }
  deleteBoat(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Boats/${id}`); }

  // ========== EXCURSIONS ==========
  getExcursions(): Observable<Excursion[]> { return this.http.get<Excursion[]>(`${this.api}/api/Excursions`); }
  getExcursion(id: number): Observable<Excursion> { return this.http.get<Excursion>(`${this.api}/api/Excursions/${id}`); }
  createExcursion(data: Excursion): Observable<Excursion> { return this.http.post<Excursion>(`${this.api}/api/Excursions`, data); }
  updateExcursion(id: number, data: Excursion): Observable<Excursion> { return this.http.put<Excursion>(`${this.api}/api/Excursions/${id}`, data); }
  deleteExcursion(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Excursions/${id}`); }

  // ========== EXCURSION SUPPLIERS ==========
  getExcursionSuppliers(): Observable<ExcursionSupplier[]> { return this.http.get<ExcursionSupplier[]>(`${this.api}/api/ExcursionSuppliers`); }
  getExcursionSupplier(id: number): Observable<ExcursionSupplier> { return this.http.get<ExcursionSupplier>(`${this.api}/api/ExcursionSuppliers/${id}`); }
  createExcursionSupplier(data: ExcursionSupplier): Observable<ExcursionSupplier> { return this.http.post<ExcursionSupplier>(`${this.api}/api/ExcursionSuppliers`, data); }
  updateExcursionSupplier(id: number, data: ExcursionSupplier): Observable<ExcursionSupplier> { return this.http.put<ExcursionSupplier>(`${this.api}/api/ExcursionSuppliers/${id}`, data); }
  deleteExcursionSupplier(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/ExcursionSuppliers/${id}`); }

  // ========== GUIDES ==========
  getGuides(): Observable<Guide[]> { return this.http.get<Guide[]>(`${this.api}/api/Guides`); }
  getGuide(id: number): Observable<Guide> { return this.http.get<Guide>(`${this.api}/api/Guides/${id}`); }
  createGuide(data: Guide): Observable<Guide> { return this.http.post<Guide>(`${this.api}/api/Guides`, data); }
  updateGuide(id: number, data: Guide): Observable<Guide> { return this.http.put<Guide>(`${this.api}/api/Guides/${id}`, data); }
  deleteGuide(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Guides/${id}`); }

  // ========== HOTEL DESTINATIONS ==========
  getHotelDestinations(): Observable<HotelDestination[]> { return this.http.get<HotelDestination[]>(`${this.api}/api/HotelDestinations`); }
  getHotelDestination(id: number): Observable<HotelDestination> { return this.http.get<HotelDestination>(`${this.api}/api/HotelDestinations/${id}`); }
  createHotelDestination(data: HotelDestination): Observable<HotelDestination> { return this.http.post<HotelDestination>(`${this.api}/api/HotelDestinations`, data); }
  updateHotelDestination(id: number, data: HotelDestination): Observable<HotelDestination> { return this.http.put<HotelDestination>(`${this.api}/api/HotelDestinations/${id}`, data); }
  deleteHotelDestination(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/HotelDestinations/${id}`); }

  // ========== HOTELS ==========
  getHotels(): Observable<Hotel[]> { return this.http.get<Hotel[]>(`${this.api}/api/Hotels`); }
  getHotel(id: number): Observable<Hotel> { return this.http.get<Hotel>(`${this.api}/api/Hotels/${id}`); }
  createHotel(data: Hotel): Observable<Hotel> { return this.http.post<Hotel>(`${this.api}/api/Hotels`, data); }
  updateHotel(id: number, data: Hotel): Observable<Hotel> { return this.http.put<Hotel>(`${this.api}/api/Hotels/${id}`, data); }
  deleteHotel(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Hotels/${id}`); }

  // ========== NATIONALITIES ==========
  getNationalities(): Observable<Nationality[]> { return this.http.get<Nationality[]>(`${this.api}/api/Nationalities`); }
  getNationality(id: number): Observable<Nationality> { return this.http.get<Nationality>(`${this.api}/api/Nationalities/${id}`); }
  createNationality(data: Nationality): Observable<Nationality> { return this.http.post<Nationality>(`${this.api}/api/Nationalities`, data); }
  updateNationality(id: number, data: Nationality): Observable<Nationality> { return this.http.put<Nationality>(`${this.api}/api/Nationalities/${id}`, data); }
  deleteNationality(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Nationalities/${id}`); }

  // ========== PRICE LISTS ==========
  getPriceLists(): Observable<PriceList[]> { return this.http.get<PriceList[]>(`${this.api}/api/PriceLists`); }
  getPriceList(id: number): Observable<PriceList> { return this.http.get<PriceList>(`${this.api}/api/PriceLists/${id}`); }
  createPriceList(data: PriceList): Observable<PriceList> { return this.http.post<PriceList>(`${this.api}/api/PriceLists`, data); }
  updatePriceList(id: number, data: PriceList): Observable<PriceList> { return this.http.put<PriceList>(`${this.api}/api/PriceLists/${id}`, data); }
  deletePriceList(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/PriceLists/${id}`); }

  // ========== RATES ==========
  getRates(): Observable<Rate[]> { return this.http.get<Rate[]>(`${this.api}/api/Rates`); }
  getRate(id: number): Observable<Rate> { return this.http.get<Rate>(`${this.api}/api/Rates/${id}`); }
  createRate(data: Rate): Observable<Rate> { return this.http.post<Rate>(`${this.api}/api/Rates`, data); }
  updateRate(id: number, data: Rate): Observable<Rate> { return this.http.put<Rate>(`${this.api}/api/Rates/${id}`, data); }
  deleteRate(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Rates/${id}`); }

  // ========== REPS ==========
  getReps(): Observable<Rep[]> { return this.http.get<Rep[]>(`${this.api}/api/Reps`); }
  getRep(id: number): Observable<Rep> { return this.http.get<Rep>(`${this.api}/api/Reps/${id}`); }
  createRep(data: Rep): Observable<Rep> { return this.http.post<Rep>(`${this.api}/api/Reps`, data); }
  updateRep(id: number, data: Rep): Observable<Rep> { return this.http.put<Rep>(`${this.api}/api/Reps/${id}`, data); }
  deleteRep(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Reps/${id}`); }

  // ========== TRANSPORTATION TYPES ==========
  getTransportationTypes(): Observable<TransportationType[]> { return this.http.get<TransportationType[]>(`${this.api}/api/TransportationTypes`); }
  getTransportationType(id: number): Observable<TransportationType> { return this.http.get<TransportationType>(`${this.api}/api/TransportationTypes/${id}`); }
  createTransportationType(data: TransportationType): Observable<TransportationType> { return this.http.post<TransportationType>(`${this.api}/api/TransportationTypes`, data); }
  updateTransportationType(id: number, data: TransportationType): Observable<TransportationType> { return this.http.put<TransportationType>(`${this.api}/api/TransportationTypes/${id}`, data); }
  deleteTransportationType(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/TransportationTypes/${id}`); }

  // ========== TRANSPORTATION SUPPLIERS ==========
  getTransportationSuppliers(): Observable<TransportationSupplier[]> { return this.http.get<TransportationSupplier[]>(`${this.api}/api/TransportationSuppliers`); }
  getTransportationSupplier(id: number): Observable<TransportationSupplier> { return this.http.get<TransportationSupplier>(`${this.api}/api/TransportationSuppliers/${id}`); }
  createTransportationSupplier(data: TransportationSupplier): Observable<TransportationSupplier> { return this.http.post<TransportationSupplier>(`${this.api}/api/TransportationSuppliers`, data); }
  updateTransportationSupplier(id: number, data: TransportationSupplier): Observable<TransportationSupplier> { return this.http.put<TransportationSupplier>(`${this.api}/api/TransportationSuppliers/${id}`, data); }
  deleteTransportationSupplier(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/TransportationSuppliers/${id}`); }

  // ========== TRANSPORTATION COSTS ==========
  getTransportationCosts(): Observable<TransportationCost[]> { return this.http.get<TransportationCost[]>(`${this.api}/api/TransportationCosts`); }
  getTransportationCost(id: number): Observable<TransportationCost> { return this.http.get<TransportationCost>(`${this.api}/api/TransportationCosts/${id}`); }
  createTransportationCost(data: TransportationCost): Observable<TransportationCost> { return this.http.post<TransportationCost>(`${this.api}/api/TransportationCosts`, data); }
  updateTransportationCost(id: number, data: TransportationCost): Observable<TransportationCost> { return this.http.put<TransportationCost>(`${this.api}/api/TransportationCosts/${id}`, data); }
  deleteTransportationCost(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/TransportationCosts/${id}`); }

  // ========== VOUCHERS ==========
  getVouchers(): Observable<Voucher[]> { return this.http.get<Voucher[]>(`${this.api}/api/Vouchers`); }
  getVoucher(id: number): Observable<Voucher> { return this.http.get<Voucher>(`${this.api}/api/Vouchers/${id}`); }
  createVoucher(data: Voucher): Observable<Voucher> { return this.http.post<Voucher>(`${this.api}/api/Vouchers`, data); }
  updateVoucher(id: number, data: Voucher): Observable<Voucher> { return this.http.put<Voucher>(`${this.api}/api/Vouchers/${id}`, data); }
  deleteVoucher(id: number): Observable<void> { return this.http.delete<void>(`${this.api}/api/Vouchers/${id}`); }

  // ========== UTILITY ==========
  getCurrentDateTime(): string {
    return new Date().toISOString();
  }
}
