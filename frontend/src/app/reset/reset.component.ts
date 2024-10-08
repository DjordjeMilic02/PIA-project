import { Component } from '@angular/core';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent
{
  username: string = '';
  password: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  passwordError: string | null = null;
  confirmPasswordError: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private userService: UserService) {}

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

  resetPassword(): void {
    if (!this.validatePassword(this.newPassword))
    {
      return;
    }

    if (this.newPassword !== this.confirmPassword)
    {
      this.confirmPasswordError = 'Passwordi se ne poklapaju.';
      return;
    }

    this.confirmPasswordError = null;

    this.userService.resetPassword(this.username, this.password, this.newPassword).subscribe(
      response => {
        this.successMessage = 'Uspeh';
        this.errorMessage = null;
      },
      error => {
        this.errorMessage = 'Greska';
        this.successMessage = null;
      }
    );
  }
}