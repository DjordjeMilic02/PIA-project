import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { CompanyService } from '../services/company.service';
import { ZahteviService } from '../services/zahtevi.service';
import User from '../models/user';
import Company from '../models/company';
import Zahtev from '../models/zahtev';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vlasnik',
  templateUrl: './vlasnik.component.html',
  styleUrls: ['./vlasnik.component.css']
})
export class VlasnikComponent implements OnInit
{
  owner: User | null = null;
  emailError: string | null = null;
  creditCardError: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  currentPage: number = 0;
  totalPages: number = 4;

  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  decoratorsMap: Map<string, User[]> = new Map();
  searchName: string = '';
  searchAddress: string = '';

  zahtevi: Zahtev[] = [];
  zahtevErrorMessage: string | null = null;

  pastRequests: Zahtev[] = [];
  futureRequests: Zahtev[] = [];
  renovatableRequests: Zahtev[] = [];

  constructor(private userService: UserService, private companyService: CompanyService, private zahtevService: ZahteviService, private router: Router)
  {

  }

  ngOnInit(): void
  {
    const username = localStorage.getItem('ulogovan');
    if (username) {
      this.userService.getUserByUsername(username).subscribe(
        (user) => {
          this.owner = user;
          this.loadZahtevi();
        },
        (error) => this.errorMessage = 'Greska pri dohvatanju korisnika.'
      );
    }
    this.loadCompanies();
  }

  loadCompanies(): void
  {
    this.companyService.getCompanies().subscribe(
      (companies) => {
        this.companies = companies;
        this.fetchDesignerDetails();
        this.filteredCompanies = [...this.companies];
      },
      (error) => (this.errorMessage = 'Greska pri dohvatanju kompanija.')
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
          (error) => (this.errorMessage = `Greska pri dohvatanju podataka za: ${username}.`)
        );
      });
    });
  }

  updateFilteredCompanies(): void
  {
    this.filteredCompanies = [...this.companies];

    if (this.searchName) {
      this.filteredCompanies = this.filteredCompanies.filter((company) =>
        company.name.toLowerCase().includes(this.searchName.toLowerCase())
      );
    }

    if (this.searchAddress) {
      this.filteredCompanies = this.filteredCompanies.filter((company) =>
        company.address.toLowerCase().includes(this.searchAddress.toLowerCase())
      );
    }
  }

  previousPage(): void
  {
    if (this.currentPage > 0)
    {
      this.currentPage--;
    }
  }

  nextPage(): void
  {
    if (this.currentPage < this.totalPages - 1)
    {
      this.currentPage++;
    }
  }

  validateEmail(email: string): boolean
  {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      this.emailError = 'Pogresan format mejla.';
      return false;
    }
    this.emailError = null;
    return true;
  }

  validateCreditCard(creditCardNumber: string): boolean
  {
    const format1 = /^(300|301|302|303)\d{12}$/;
    const format2 = /^(36|38)\d{13}$/;
    const format3 = /^(51|52|53|54|55)\d{14}$/;
    const format4 = /^(4\d{12}(\d{3})?)$/;

    if (
      format1.test(creditCardNumber) ||
      format2.test(creditCardNumber) ||
      format3.test(creditCardNumber) ||
      format4.test(creditCardNumber)
    ) {
      this.creditCardError = null;
      return true;
    } else {
      this.creditCardError = 'Pogresan broj kreditne kartice.';
      return false;
    }
  }

  getProfilePhotoUrl(base64String: string): string
  {
    if (base64String.startsWith('data:image/jpeg;base64,') || base64String.startsWith('data:image/png;base64,')) {
      return base64String;
    }
    if (base64String.charAt(0) === 'i' && base64String.charAt(1) === 'V') {
      return `data:image/png;base64,${base64String}`;
    }
    return `data:image/jpeg;base64,${base64String}`;
  }

  onFileSelected(event: any, user: User): void {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        user.profile_photo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  updateOwner(): void
  {
    if (!this.owner) {
      return;
    }

    if (!this.validateEmail(this.owner.email)) {
      return;
    }

    if (!this.validateCreditCard(this.owner.credit_card_number)) {
      return;
    }

    const oldUsername = localStorage.getItem('ulogovan');
    const newUsername = this.owner.username;

    this.userService.updateUser(this.owner, oldUsername!).subscribe(
      (response) => {
        this.successMessage = 'Uspeh!';
        this.errorMessage = null;
        if (oldUsername !== newUsername) {
          localStorage.setItem('ulogovan', newUsername);
        }
      },
      (error) => {
        this.errorMessage = 'Greska.';
        this.successMessage = null;
      }
    );
  }

  loadZahtevi(): void
  {
    if (!this.owner)
    {
      return;
    }

    this.zahtevService.getZahtevForUser(this.owner.username).subscribe(
      (zahtevi) => {
        this.zahtevi = zahtevi;
      },
      (error) => (this.zahtevErrorMessage = 'Greska sa dohvatom zahteva.')
    );
    this.zahtevService.getRenovatable(this.owner.username).subscribe(
      (renovatableRequests) => {
        this.renovatableRequests = renovatableRequests;
        this.categorizeRenovatableRequests();
      },
      (error) => (this.zahtevErrorMessage = 'Gresak sa dohvatom zahteva.')
    );
  }

  categorizeRenovatableRequests(): void
  {
    const currentDate = new Date();

    this.pastRequests = this.pastRequests.concat(
      this.renovatableRequests.filter((zahtev) => new Date(zahtev.dateActive) <= currentDate && zahtev.odrzavanjeRequested == false)
    );
    this.futureRequests = this.futureRequests.concat(
      this.renovatableRequests.filter((zahtev) => new Date(zahtev.dateActive) > currentDate || zahtev.odrzavanjeRequested == true)
    );
  }

  isOlderThanSixMonths(date: Date): boolean
  {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return new Date(date) < sixMonthsAgo;
  }

  handleOdrzavanje(zahtev: Zahtev): void
  {
    this.zahtevService.requestOdrzavanje(zahtev._id).subscribe(
      (response) => {
        zahtev.odrzavanjeRequested = true;
        this.successMessage = 'Uspeh.';
        window.location.reload();
      },
      (error) => {
        this.errorMessage = 'Greska.';
      }
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

  deleteZahtev(zahtevId: number): void
  {
    this.zahtevService.deleteZahtev(zahtevId).subscribe(
      () => {
        this.successMessage = 'Uspeh.';
        this.zahtevi = this.zahtevi.filter((zahtev) => zahtev._id !== zahtevId);
      },
      (error) => {
        this.errorMessage = 'Greska.';
      }
    );
  }

  isMoreThanOneDayInFuture(date: Date): boolean
  {
    const oneDayLater = new Date();
    oneDayLater.setDate(oneDayLater.getDate() + 1);
    return new Date(date) > oneDayLater;
  }

  scrollToTop(): void
  {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void
  {
    this.router.navigate(['']);
  }
}