import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { ZahteviService } from '../services/zahtevi.service';
import User from '../models/user';
import Zahtev from '../models/zahtev';
import { DatePipe } from '@angular/common';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dizajner',
  templateUrl: './dizajner.component.html',
  styleUrls: ['./dizajner.component.css']
})
export class DizajnerComponent implements OnInit {

  monthlyJobsChartData!: ChartData<'bar'>;
  monthlyJobsChartType: ChartType = 'bar';
  monthlyJobsChartOptions: ChartOptions = {
    responsive: true,
  };

  designerJobsChartData!: ChartData<'pie'>;
  designerJobsChartType: ChartType = 'pie';
  designerJobsChartOptions: ChartOptions = {
    responsive: true,
  };

  weeklyJobsChartData!: ChartData<'bar'>;
  weeklyJobsChartType: ChartType = 'bar';
  weeklyJobsChartOptions: ChartOptions = {
    responsive: true,
  };


  designer: User | null = null;
  emailError: string | null = null;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  currentPage: number = 0;
  totalPages: number = 4;

  requests: Zahtev[] = [];
  maintenanceRequests: Zahtev[] = [];
  estimatedHours: number = 0;

  constructor(private userService: UserService, private zahtevService: ZahteviService, private datePipe: DatePipe, private router: Router)
  {

  }

  ngOnInit(): void
  {
    const username = localStorage.getItem('ulogovan');
    if (username)
    {
      this.userService.getUserByUsername(username).subscribe(
        (user) => {
          this.designer = user;
          this.loadCompanyRequests(user.username);
          this.loadMaintenanceRequests(user.username);
          this.loadChartData();
        },
        (error) => this.errorMessage = 'Greska.'
      );
    }
  }

  loadChartData() {
    const user = 'null';

    this.zahtevService.getAll(localStorage.getItem('ulogovan')!).subscribe((zahtevi: Zahtev[]) => {
      const finishedJobs = zahtevi;

      const monthlyCounts = new Array(12).fill(0);
      finishedJobs.forEach(job => {
        const month = new Date(job.dateFinished).getMonth();
        monthlyCounts[month]++;
      });

      this.monthlyJobsChartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{ data: monthlyCounts, label: 'Kompletirano poslova' }]
      };

      const designerJobCounts: { [key: string]: number } = {};
      finishedJobs.forEach(job => {
        const designer = job.designated || 'greska';
        if (!designerJobCounts[designer]) {
          designerJobCounts[designer] = 0;
        }
        designerJobCounts[designer]++;
      });

      this.designerJobsChartData = {
        labels: Object.keys(designerJobCounts),
        datasets: [{ data: Object.values(designerJobCounts) }]
      };

      const dailyCounts = new Array(7).fill(0);
      const dailyTotals = new Array(7).fill(0);
      finishedJobs.forEach(job => {
        const day = new Date(job.dateFinished).getDay();
        dailyCounts[day]++;
        dailyTotals[day] += 1;
      });

      const averageDailyCounts = dailyCounts.map((count) =>
        count / 104
      );

      this.weeklyJobsChartData = {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: averageDailyCounts, label: 'Prosecan broj poslova po danu' }]
      };
    });
  }

  loadCompanyRequests(username: string): void
  {
    this.zahtevService.getZahteviForCompany(username).subscribe(
      (requests: Zahtev[]) => this.requests = requests,
      (error: any) => this.errorMessage = 'Greska pri dohvatanju kompanija.'
    );
  }

  acceptTask(zahtevId: number): void
  {
    if (!this.designer) return;

    this.zahtevService.acceptTask(zahtevId, this.designer.username).subscribe(
      () => {
        this.successMessage = 'Uspeh!';
        this.loadCompanyRequests(this.designer!.username);
      },
      (error: any) => this.errorMessage = 'Greska.'
    );
  }

  rejectTask(zahtevId: number): void
  {
    const rejectionText = prompt('Unesi razlog odbijana:');
    if (rejectionText !== null) {
      this.zahtevService.rejectTask(zahtevId, rejectionText).subscribe(
        () => {
          this.successMessage = 'Uspeh!';
          this.loadCompanyRequests(this.designer!.username);
        },
        (error: any) => this.errorMessage = 'Greska!'
      );
    }
  }

  finishTask(zahtevId: number): void
  {
    this.zahtevService.finishTask(zahtevId).subscribe(
      () => {
        this.successMessage = 'Uspeh!';
        this.loadCompanyRequests(this.designer!.username)
      },
      (error: any) => this.errorMessage = 'Greska.'
    );
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
      this.emailError = 'Los format mejla.';
      return false;
    }
    this.emailError = null;
    return true;
  }

  getProfilePhotoUrl(base64String: string): string
  {
    if (base64String.startsWith('data:image/jpeg;base64,') || base64String.startsWith('data:image/png;base64,'))
    {
      return base64String;
    }
    if (base64String.charAt(0) === 'i' && base64String.charAt(1) === 'V')
    {
      return `data:image/png;base64,${base64String}`;
    }
    return `data:image/jpeg;base64,${base64String}`;
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

  updateDesigner(): void
  {
    if (!this.designer)
    {
      return;
    }

    if (!this.validateEmail(this.designer.email))
    {
      return;
    }

    const oldUsername = localStorage.getItem('ulogovan');
    const newUsername = this.designer.username;

    this.userService.updateUser(this.designer, oldUsername!).subscribe(
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

  loadMaintenanceRequests(company: string): void
  {
    this.zahtevService.getM(company).subscribe(
      (requests: Zahtev[]) => this.maintenanceRequests = requests,
      (error: any) => this.errorMessage = 'Greska.'
    );
  }

  acceptMaintenance(request: Zahtev): void
  {
    if (!this.estimatedHours || this.estimatedHours <= 0)
    {
        this.errorMessage = 'Los format sati.';
        return;
    }

    const currentDate = new Date();
    const completionDate = new Date(currentDate.getTime() + this.estimatedHours * 60 * 60 * 1000);

    this.zahtevService.acceptM(request._id, completionDate).subscribe(
        () => {
            this.successMessage = 'Uspeh!';
            this.loadMaintenanceRequests(this.designer!.username);
        },
        (error: any) => this.errorMessage = 'Greska.'
    );
}

  rejectMaintenance(zahtevId: number): void
  {
    this.zahtevService.rejectM(zahtevId).subscribe(
      () => {
        this.successMessage = 'Uspeh!';
        this.loadMaintenanceRequests(this.designer!.username);
      },
      (error: any) => this.errorMessage = 'Greska.'
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
}
