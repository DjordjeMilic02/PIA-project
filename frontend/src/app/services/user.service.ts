import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import User from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private http: HttpClient) { }

  url = "http://localhost:4000/user";

  login(username: string, password: string, tip: string) {
    let data = {
      username: username, password: password, type: tip
    }
    return this.http.post<User>(`${this.url}/login`, data)
  }

  getAll() {
    let data = {
    }
    return this.http.post<Array<User>>(`${this.url}/getAll`, data)
  }

  updateUser(user: User, originalUsername: string) {
    let data = {
        originalUsername: originalUsername, // This should match what the backend is expecting
        updatedData: user // This should match what the backend is expecting
    }
    return this.http.post<User>(`${this.url}/updateUser`, data);
  }

  getUserByUsername(username: string) {
    let data = {
      username: username
    }
    return this.http.post<User>(`${this.url}/getByUsername`, data);
  }

  addUser(user: User){
    let data = {
      user: user
    }
    return this.http.post<User>(`${this.url}/addUser`, data)
  }

  resetPassword(username: string, password: string, newPassword: string){
    let data = {
      username: username,
      password: password,
      newPassword: newPassword
    }
    return this.http.post<any>(`${this.url}/resetPassword`, data)
  }

  getDecoratorCount(){
    let data = {
    }
    return this.http.post<{ count: number }>(`${this.url}/getDC`, data)
  }

  getOwnerCount(){
    let data = {
    }
    return this.http.post<{ count: number }>(`${this.url}/getOC`, data)
  }
}
