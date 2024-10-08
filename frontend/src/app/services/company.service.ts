import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import Company from '../models/company';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  constructor(private http: HttpClient) { }

  url = "http://localhost:4000/company";

  addCompany(company: Company){
    let data = {
      company: company
    }
    return this.http.post<Company>(`${this.url}/addCompany`, data)
  }

  getCompanies(){
    let data = {
    }
    return this.http.post<Company[]>(`${this.url}/getCompanies`, data)
  }
}
