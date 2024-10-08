import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Zahtev from '../models/zahtev';
import User from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class ZahteviService {

  constructor(private http: HttpClient) { }

  url = "http://localhost:4000/zahtevi";

  addZahtev(zahtev: Zahtev){
    let data = {
      zahtev: zahtev
    }
    return this.http.post<Zahtev>(`${this.url}/addZahtev`, data)
  }

  getZahtevForUser(user: String){
    let data = {
      user:user
    }
    return this.http.post<Zahtev[]>(`${this.url}/getZU`, data)
  }

  getRenovatable(user: String){
    let data = {
      user:user
    }
    return this.http.post<Zahtev[]>(`${this.url}/getRen`, data)
  }
  
  requestOdrzavanje(zahtevId: number){
    let data = {
      _id: zahtevId
    }
    return this.http.post<any>(`${this.url}/RO`, data);
  }

  deleteZahtev(zahtevId: number){
    let data = {
      _id: zahtevId
    }
    return this.http.post<any>(`${this.url}/DZ`, data);
  }

  getZahteviForCompany(user:string){
    let data = {
      user:user
    }
    return this.http.post<Zahtev[]>(`${this.url}/GetZahteviForCompany`, data);
  }

  acceptTask(_id: number, user: string){
    let data = {
      _id: _id,
      user:user
    }
    return this.http.post<any>(`${this.url}/acceptTask`, data);
  }

  rejectTask(_id: number, text: string){
    let data = {
      _id: _id,
      rejectionText: text
    }
    return this.http.post<any>(`${this.url}/rejectTask`, data);
  }

  finishTask(_id: number){
    let data = {
      _id: _id,
    }
    return this.http.post<any>(`${this.url}/finishTask`, data);
  }

  getM(user: string){
    let data = {
      user: user
    }
    return this.http.post<Zahtev[]>(`${this.url}/getM`, data);
  }

  acceptM(_id: number, dateActive: Date){
    let data = {
      _id: _id,
      dateActive:dateActive
    }
    return this.http.post<any>(`${this.url}/acceptM`, data);
  }

  rejectM(_id: number){
    let data = {
      _id: _id,
    }
    return this.http.post<any>(`${this.url}/rejectM`, data);
  }

  getAll(user:string){
    let data = {
      user:user
    }
    return this.http.post<Zahtev[]>(`${this.url}/getAll`, data);
  }

  getF(user:string){
    let data = {
      user:user
    }
    return this.http.post<{count:number}>(`${this.url}/getDone`, data);
  }

  getDays()
  {
    let data = {
    }
    return this.http.post<{last24Hours: number, last7Days: number, last30Days: number}>(`${this.url}/getDays`, data);
  }
}
