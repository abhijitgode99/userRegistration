import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class RegistrationServiceService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}/countries`);
  }

  checkUsernameAvailability(username: string): Observable<{ available: boolean }> {
    return this.http.get<{ username: string; available: boolean }[]>(`${this.apiUrl}/register`).pipe(
      map(users => {
        const user = users.find(u => u.username === username);
        return { available: !user };
      })
    );
  }

  registerUser(username: string, country: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, { username, country });
  }
}
