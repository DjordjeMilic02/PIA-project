import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit
{

  constructor(private router: Router, private userService: UserService) { }
  username: string = "";
  password: string = "";
  error: string = "";
  admin: string = "";

  ngOnInit(): void
  {
    const currentRoute = this.router.url;
    if (currentRoute === '/adminLogin')
    {
      this.admin = "admin";
    }
    else
      this.admin = ""
  }

  login() {
    this.userService.login(this.username, this.password, this.admin).subscribe(
      response => {
        if (response) {
          localStorage.setItem("ulogovan", response.username);
          this.router.navigate([response.role]);
        } else {
          this.error = "Losi podaci!";
        }
      },
      error => {
        this.error = "Korisnik sa ovim podacima nije pronadjen";
      }
    );
  }
}