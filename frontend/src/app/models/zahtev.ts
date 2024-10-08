export default class Zahtev {
  _id: number = 0;
  dateTime: Date = new Date();
  Area: number = 0;
  Type: string = "";
  extra: string = "";
  company: string = "";
  designated?: string | null;
  services: string[] = [];
  raspored: any;
  callerUsername: string = "";
  dateFinished: Date = new Date();
  dateActive: Date = new Date();
  waterSurfaceCount: number = 0;
  finished: boolean = false;
  rejected: boolean = false;
  rejectionText: string = "";
  odrzavanjeRequested: boolean = false;
}