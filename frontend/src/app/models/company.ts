export default class Company {
    name: string = "";
    address: string = "";
    services: string[] = [];
    prices: number[] = [];
    contact_number: string = "";
    vacation_start: Date = new Date();
    vacation_end: Date = new Date();
    decorators: Array<string> = [];
}