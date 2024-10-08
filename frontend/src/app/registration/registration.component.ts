import { Component } from '@angular/core';
import User from '../models/user';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent
{
  newOwner: User = new User();
  creditCardError: string | null = null;
  passwordError: string | null = null;
  emailError: string | null = null;

  constructor(private userService: UserService, private router: Router)
  {

  }
  
  onDesignerFileSelected(event: any): void
  {
    const file: File = event.target.files[0];
    if (file)
    {
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type))
      {
        alert('Only JPG and PNG formats are supported.');
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
            alert('Image resolution must be between 100x100px and 300x300px.');
            return;
          }

          this.newOwner.profile_photo = reader.result as string;
        };
      };

      reader.readAsDataURL(file);
    }
  }

  validateEmail(email: string): boolean
  {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  validateCreditCard(creditCardNumber: string): boolean
  {
    const format1 = /^(300|301|302|303)\d{12}$/;
    const format2 = /^(36|38)\d{13}$/;
    const format3 = /^(51|52|53|54|55)\d{14}$/;
    const format4 = /^(4539|4556|4916|4532|4929|4485|4716)\d{12}$/;

    if (format1.test(creditCardNumber) || format2.test(creditCardNumber) || format3.test(creditCardNumber) || format4.test(creditCardNumber)) {
        return true;
    } else {
        this.creditCardError = 'Invalid credit card number.';
        return false;
    }
  }

  validatePassword(password: string): boolean
  {
    const passwordRegex = /^(?=.{6,10}$)(?=[a-zA-Z])(?=.*[A-Z])(?=.*[a-z]{3,})(?=.*\d)(?=.*[^a-zA-Z0-9])/;

    if (!passwordRegex.test(password)) {
      this.passwordError = 'Pasword mora biti izmedju 6 i 10 karaktera, Mora pocinjati slovom, Sadrzati jedno veliko slovo, 3 mala slova, 1 broj, i 1 specijalan karakter.';
      return false;
    }

    this.passwordError = null;
    return true;
  }

  onAddOwner(): void
  {
    if (!this.validateEmail(this.newOwner.email))
    {
      alert('Neadekvatan format emejla.');
      return;
    }
    if (!this.validateCreditCard(this.newOwner.credit_card_number))
    {
      alert('Neadekvatan broj kreditne kartice');
      return;
    }
    if (!this.validatePassword(this.newOwner.password))
    {
      alert('Neadekvatan password');
      return;
    }

    if (!this.newOwner.profile_photo)
    {
      this.newOwner.profile_photo = this.generateDefaultProfilePhoto();
    }

    this.newOwner.role = 'vlasnik';

    this.userService.addUser(this.newOwner).subscribe(
      () => {
        alert('Uspeh!');
      },
      (error: any) => {
        console.error('Greska! ', error);
      }
    );
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


}
