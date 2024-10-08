import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CompanyService } from '../services/company.service';
import { ZahteviService } from '../services/zahtevi.service';
import Company from '../models/company';
import Zahtev from '../models/zahtev';

@Component({
  selector: 'app-company-details',
  templateUrl: './company-details.component.html',
  styleUrls: ['./company-details.component.css']
})
export class CompanyDetailsComponent implements OnInit {
  @ViewChild('propertyCanvas') propertyCanvas?: ElementRef<HTMLCanvasElement>;

  company: Company | null = null;
  errorMessage: string = '';
  successMessage: string = '';
  currentPage = 0;
  totalPages = 2;

  job = {
    date: '',
    time: '',
    surfaceArea: 0,
    spaceType: '',
    sunbedsArea: 0,
    poolArea: 0,
    greeneryArea: 0,
    fountainArea: 0,
    restaurantGreeneryArea: 0,
    comments: '',
    selectedServices: [] as string[],
    raspored: {} as any,
    waterSurfaceCount: 0,
  };

  constructor(private route: ActivatedRoute, private companyService: CompanyService, private zahteviService: ZahteviService)
  {

  }

  ngOnInit(): void
  {
    const index = this.route.snapshot.paramMap.get('index');
    if (index !== null) {
      this.companyService.getCompanies().subscribe(
        (companies) => {
          const companyIndex = parseInt(index, 10);
          if (companyIndex >= 0 && companyIndex < companies.length) {
            this.company = companies[companyIndex];
          } else {
            this.errorMessage = 'Greska.';
          }
        },
        (error) => (this.errorMessage = 'Greska.')
      );
    }
  }

  previousPage()
  {
    if (this.currentPage > 0)
    {
      this.currentPage--;
    }
  }

  nextPage()
  {
    this.currentPage++;
  }

  validateAreas(): boolean
  {
    let totalAreaUsed = 0;

    if (this.job.spaceType === 'Privatna basta') {
      totalAreaUsed = this.job.sunbedsArea + this.job.poolArea + this.job.greeneryArea;
    } else if (this.job.spaceType === 'Restoran') {
      totalAreaUsed = this.job.fountainArea + this.job.restaurantGreeneryArea;
    }

    if (totalAreaUsed !== this.job.surfaceArea) {
      this.errorMessage = 'Greska pri unosu povrsina.';
      return false;
    }

    this.errorMessage = '';
    return true;
  }

  isServiceSelected(service: string): boolean
  {
    return this.job.selectedServices.includes(service);
  }

  toggleServiceSelection(service: string): void
  {
    const index = this.job.selectedServices.indexOf(service);

    if (index === -1) {
      this.job.selectedServices.push(service);
    } else {
      this.job.selectedServices.splice(index, 1);
    }
  }

  onSubmit()
  {
    const isOnVacation = this.checkVacation(this.job.date);
    if (isOnVacation) {
      this.errorMessage = 'Izabran datum je tokom godisnjeg odmora firme.';
      return;
    }

    if (!this.validateAreas()) {
      return;
    }

    if (!this.company) {
      this.errorMessage = 'Greska.';
      return;
    }

    const zahtev: Zahtev = {
      _id: 0,
      dateTime: new Date(`${this.job.date}T${this.job.time}:00Z`),
      Area: this.job.surfaceArea,
      Type: this.job.spaceType,
      extra: this.job.comments,
      company: this.company.name,
      designated: null,
      services: this.job.selectedServices,
      raspored: this.job.raspored,
      callerUsername: localStorage.getItem("ulogovan")!,
      dateFinished: new Date(),
      dateActive: new Date(),
      waterSurfaceCount: this.job.waterSurfaceCount,
      finished: false,
      rejected: false,
      rejectionText: "",
      odrzavanjeRequested: false,
    };

    this.zahteviService.addZahtev(zahtev).subscribe(
      (response) => {
        this.successMessage = 'Uspeh!';
        this.errorMessage = '';
      },
      (error) => {
        this.errorMessage = 'Greska.';
        this.successMessage = '';
      }
    );
  }

  checkVacation(date: string): boolean
  {
    if (!this.company)
    {
      return false;
    }

    const vacationStart = new Date(this.company.vacation_start);
    const vacationEnd = new Date(this.company.vacation_end);
    const selectedDate = new Date(date);

    return selectedDate >= vacationStart && selectedDate <= vacationEnd;
  }

  goBack(): void
  {
    window.history.back();
  }

  onFileSelected(event: any): void
  {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        try {
          const propertyData = JSON.parse(fileContent);
          this.job.raspored = propertyData;
          this.renderProperty(propertyData);
        } catch (err) {
          this.errorMessage = 'Los JSON.';
        }
      };
      reader.readAsText(file);
    }
  }

  renderProperty(data: any): void
  {
    const canvas = this.propertyCanvas?.nativeElement;
    if (!canvas) {
      console.log('Greska sa kanvasom');
      return;
    }
  
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Greska sa kanvasom');
      return;
    }

    canvas.width = data.property.width;
    canvas.height = data.property.height;
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    const allowedShapes: { [color: string]: { [type: string]: string } } = {
      'blue': {
        'rectangle': 'swimming pool',
        'circle': 'fountain'
      },
      'brown': {
        'circle': 'table'
      },
      'green': {
        'rectangle': 'green space'
      },
      'gray': {
        'rectangle': 'sunbed/chair'
      }
    };
  
    this.job.waterSurfaceCount = 0;
  
    const shapes: Array<{ type: string; color: string; x: number; y: number; width?: number; height?: number; radius?: number }> = [];
  
    const isOverlapping = (shape1: any, shape2: any): boolean => {
      if (shape1.type === 'rectangle' && shape2.type === 'rectangle') {
        return !(shape1.x + shape1.width <= shape2.x ||
          shape1.x >= shape2.x + shape2.width ||
          shape1.y + shape1.height <= shape2.y ||
          shape1.y >= shape2.y + shape2.height);
      } else if (shape1.type === 'circle' && shape2.type === 'circle') {
        const dx = shape1.x - shape2.x;
        const dy = shape1.y - shape2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (shape1.radius + shape2.radius);
      } else if (shape1.type === 'rectangle' && shape2.type === 'circle') {
        const nearestX = Math.max(shape1.x, Math.min(shape2.x, shape1.x + shape1.width));
        const nearestY = Math.max(shape1.y, Math.min(shape2.y, shape1.y + shape1.height));
        const dx = shape2.x - nearestX;
        const dy = shape2.y - nearestY;
        return (dx * dx + dy * dy) < (shape2.radius * shape2.radius);
      } else if (shape1.type === 'circle' && shape2.type === 'rectangle') {
        return isOverlapping(shape2, shape1);
      }
      return false;
    };
  
    let blueRectanglePresent = false;
    let blueCirclePresent = false;
  
    for (const element of data.property.elements)
    {
      const shapeColor = element.color.toLowerCase();
      const shapeType = element.type;
  
      if (this.job.spaceType === 'Privatna basta' && shapeColor === 'blue' && shapeType === 'circle')
      {
        this.errorMessage = 'Fontane nisu dozvoljene u privatnoj basti.';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
  
      if (!allowedShapes[shapeColor] || !allowedShapes[shapeColor][shapeType])
      {
        this.errorMessage = `Oblik: ${shapeType} sa bojom ${shapeColor} nije dozvoljen.`;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
  
      for (const shape of shapes) 
      {
        if (isOverlapping(shape, element)) 
        {
          this.errorMessage = 'Objekti ne smeju da se preklapaju!';
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          return;
        }
      }
  
      if (shapeColor === 'blue')
      {
        if (shapeType === 'rectangle') {
          if (blueCirclePresent) {
            this.errorMessage = 'Fontane i bazeni nisu dozvoljeni u istom layoutu.';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
          }
          blueRectanglePresent = true;
          this.job.waterSurfaceCount++;
        } else if (shapeType === 'circle') {
          if (blueRectanglePresent) {
            this.errorMessage = 'Fontane i bazeni nisu dozvoljeni u istom layoutu.';
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
          }
          blueCirclePresent = true;
          this.job.waterSurfaceCount++;
        }
      }
  
      shapes.push({
        type: element.type,
        color: shapeColor,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height,
        radius: element.radius,
      });
  
      ctx.fillStyle = element.color;
      if (shapeType === 'rectangle') {
        ctx.fillRect(element.x, element.y, element.width, element.height);
      } else if (shapeType === 'circle') {
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}