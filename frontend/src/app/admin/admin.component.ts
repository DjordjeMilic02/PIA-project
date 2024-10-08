import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import User from '../models/user';
import Company from '../models/company';
import { CompanyService } from '../services/company.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit
{
  users: User[] = [];
  originalUsernames: string[] = [];
  newDesigner: User = new User();
  creditCardError: string | null = null;
  passwordError: string | null = null;
  emailError: string | null = null;
  newCompany: Company = new Company();
  designerUsername: string = '';
  newService: string = '';
  newPrice: number = 0;

  constructor(private userService: UserService, private companyService: CompanyService, private router: Router)
  {
    this.newCompany.decorators = [];
  }

  ngOnInit(): void
  {
    this.loadUsers();
  }

  loadUsers(): void
  {
    this.userService.getAll().subscribe(users => {
      this.users = users;
      this.originalUsernames = users.map(user => user.username);
    });
  }

  onRejectionChange(user: User): void
  {
    if (user.rejected) {
      user.approved = false;
      this.disableUserActions(user);
    }
  }

  onApprovalChange(user: User): void
  {
    if (user.approved)
    {
      user.rejected = false;
      this.disableUserActions(user);
    }
  }

  disableUserActions(user: User): void
  {
    user.approved = user.approved;
    user.rejected = user.rejected;
  }

  addService(): void
  {
    console.log(this.newService);
    if (this.newService.trim())
    {
      this.newCompany.services.push(this.newService.trim());
      this.newService = '';
    } else {
      alert('Greska pri dodavanju usluge.');
    }
  }
  
  removeService(index: number): void
  {
    this.newCompany.services.splice(index, 1);
  }
  
  addPrice(): void
  {
    console.log(this.newPrice);
    if (this.newPrice !== null && this.newPrice !== undefined) {
      this.newCompany.prices.push(this.newPrice);
      this.newPrice = 0;
    } else {
      alert('Greska pri dodavanju cene.');
    }
  }
  
  removePrice(index: number): void
  {
    this.newCompany.prices.splice(index, 1);
  }

  validateEmail(email: string): boolean
  {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  onFileSelected(event: any, user: User): void
  {
    const file: File = event.target.files[0];
    if (file)
    {
      const reader = new FileReader();
      reader.onload = () => {
        user.profile_photo = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(user: User): void
  {
    if (!this.validateEmail(user.email))
    {
      alert('Nevalidna email adresa.');
      return;
    }
    if (!this.validateCreditCard(user.credit_card_number))
      {
      alert('Nevalidan broj kreditne kartice');
      return;
    }

    this.userService.updateUser(user, this.originalUsernames[this.users.indexOf(user)]).subscribe(
      updatedUser => {
        alert('User updated successfully!');
      },
      error => {
        console.error('Error updating user:', error);
      }
    );
    window.location.reload();
  }

  onDesignerFileSelected(event: any): void
  {
    const file: File = event.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type))
      {
        alert('Slika mora biti JPEG ili PNG formata.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result as string;

        img.onload = () => {
          const width = img.width;
          const height = img.height;

          if (width < 100 || width > 300 || height < 100 || height > 300) {
            alert('Podrzave su samo rezolucije izmedju 100x100 i 300x300 piksela.');
            return;
          }

          this.newDesigner.profile_photo = reader.result as string;
        };
      };

      reader.readAsDataURL(file);
    }
  }

  validateCreditCard(creditCardNumber: string): boolean
  {
    const format1 = /^(300|301|302|303)\d{12}$/;
    const format2 = /^(36|38)\d{13}$/;
    const format3 = /^(51|52|53|54|55)\d{14}$/;
    const format4 = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/;

    if (format1.test(creditCardNumber) || format2.test(creditCardNumber) || format3.test(creditCardNumber) || format4.test(creditCardNumber))
    {
        return true;
    } else {
        this.creditCardError = 'Pogresan broj kreditne kartice.';
        return false;
    }
  }

  validatePassword(password: string): boolean
  {
    const passwordRegex = /^(?=.{6,10}$)(?=[a-zA-Z])(?=.*[A-Z])(?=.*[a-z]{3,})(?=.*\d)(?=.*[^a-zA-Z0-9])/;

    if (!passwordRegex.test(password))
    {
      this.passwordError = 'Pasword mora biti izmedju 6 i 10 karaktera, Mora pocinjati slovom, Sadrzati jedno veliko slovo, 3 mala slova, 1 broj, i 1 specijalan karakter.';
      return false;
    }

    this.passwordError = null;
    return true;
  }

  onAddDesigner(): void
  {
    if (!this.validateEmail(this.newDesigner.email))
    {
      alert('Pogresan email format.');
      return;
    }
    if (!this.validateCreditCard(this.newDesigner.credit_card_number))
    {
      alert('Pogresan broj kreditne kartice');
      return;
    }
    if (!this.validatePassword(this.newDesigner.password))
      {
      alert('Pogresan pasvord');
      return;
    }

    if (!this.newDesigner.profile_photo)
    {
      this.newDesigner.profile_photo = this.generateDefaultProfilePhoto();
    }

    this.newDesigner.role = 'dizajner';

    this.userService.addUser(this.newDesigner).subscribe(
      addedUser => {
        alert('Uspesan zahtev');
        this.users.push(addedUser);
        this.newDesigner = new User();
      },
      error => {
        console.error('Greska', error);
      }
    );
    window.location.reload();
  }

  generateDefaultProfilePhoto(): string
  {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;

    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = 'black';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    return canvas.toDataURL('image/png');
  }

  resetForm(): void
  {
    this.newDesigner = new User();
    this.creditCardError = null;
  }

  onAddCompany(): void
  {
    if (this.newCompany.decorators.length < 2) {
        alert('Morate dodati makar 2 dekoratora');
        return;
    }

    if (this.newCompany.vacation_start && this.newCompany.vacation_end)
    {
        const startDate = new Date(this.newCompany.vacation_start);
        const endDate = new Date(this.newCompany.vacation_end);

        if (endDate < startDate)
        {
            alert('Kraj odmora mora biti nakon pocetka odmora.');
            return;
        }
    }

    this.companyService.addCompany(this.newCompany).subscribe(
        addedCompany => {
            alert('Uspeh');
            this.newCompany = new Company();
            this.newCompany.decorators = [];
        },
        error => {
            console.error('Greska', error);
            alert('Greska');
        }
    );
  }

  scrollToTop(): void
  {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  logout(): void
  {
    this.router.navigate(['']);
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

  addDesignerByUsername(): void
  {
    const username = this.designerUsername.trim();
    if (username && !this.newCompany.decorators.includes(username))
    {
      this.newCompany.decorators.push(username);
      this.designerUsername = '';
    } else if (!username) {
      alert('Lose korisnocko ime');
    } else {
      alert('Ne mozete dodati istog dizajnera 2 puta');
    }
  }

  removeDesigner(index: number): void
  {
    this.newCompany.decorators.splice(index, 1);
  }
}