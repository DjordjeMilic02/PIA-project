import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import User from '../models/user';
import Company from '../models/company';
import { ZahteviService } from '../services/zahtevi.service';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit
{
  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  decoratorsMap: Map<string, User[]> = new Map();
  searchCompanyName: string = '';
  searchCompanyAddress: string = '';
  finished: number = 0;
  decoratorCount: number = 0;
  ownerCount: number = 0;
  finishedLast24Hours: number = 0;
  finishedLast7Days: number = 0;
  finishedLast30Days: number = 0;

  constructor(private router: Router, private userService: UserService, private companyService: CompanyService, private zahtevService: ZahteviService)
  { 

  }

  ngOnInit(): void
  {
    this.loadCompanies();
    const user = localStorage.getItem('ulogovan');
    
    if (user) {
      this.zahtevService.getF(user).subscribe(
        (count) => {
          this.finished = count.count;
        },
        (error) => {
          console.error('Greska pri dostavljanju broja zahteva:', error);
        }
      );
    }

    this.zahtevService.getDays().subscribe(
      (data) => {
        this.finishedLast24Hours = data.last24Hours;
        this.finishedLast7Days = data.last7Days;
        this.finishedLast30Days = data.last30Days;
      },
      (error) => {
        console.error('Greska pri dostavljanju podataka o gotovim zahtevima:', error);
      }
    );

    this.userService.getDecoratorCount().subscribe(
      (response) => {
        this.decoratorCount = response.count;
      },
      (error) => {
        console.error('Greska pri dohvatanju dekoratora', error);
      }
    );

    this.userService.getOwnerCount().subscribe(
      (response) => {
        this.ownerCount = response.count;
      },
      (error) => {
        console.error('Greska pri dohvatanju vlasnika', error);
      }
    );

  }

  loadCompanies(): void
  {
    this.companyService.getCompanies().subscribe(
      (companies) => {
        this.companies = companies;
        this.fetchDesignerDetails();
        this.filteredCompanies = [...this.companies];
      },
      (error) => {
        console.error('Greska pri dohvatanju kompanija', error);
      }
    );
  }

  fetchDesignerDetails(): void
  {
    this.companies.forEach((company) => {
      const designers: User[] = [];
      company.decorators.forEach((username) => {
        this.userService.getUserByUsername(username).subscribe(
          (user) => {
            designers.push(user);
            this.decoratorsMap.set(company.name, designers);
          },
          (error) => {
            console.error(`Greska pri dohvatanju dekoratora ${username}:`, error);
          }
        );
      });
    });
  }

  updateFilteredCompanies(): void
  {
    this.filteredCompanies = this.companies.filter(company =>
      company.name.toLowerCase().includes(this.searchCompanyName.toLowerCase()) &&
      company.address.toLowerCase().includes(this.searchCompanyAddress.toLowerCase())
    );
  }

  sortCompaniesByName(): void
  {
    this.filteredCompanies.sort((a, b) => a.name.localeCompare(b.name));
  }

  sortCompaniesByAddress(): void
  {
    this.filteredCompanies.sort((a, b) => a.address.localeCompare(b.address));
  }

  login(): void
  {
    this.router.navigate(['login']);
  }

  registration(): void
  {
    this.router.navigate(['registration']);
  }

  reset(): void
  {
    this.router.navigate(['reset']);
  }
}