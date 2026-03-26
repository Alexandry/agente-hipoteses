import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Idea {
  id?: number;
  originalText?: string;
  domain?: string;
  context?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Hypothesis {
  id?: number;
  sessionId?: number;
  description?: string;
  associatedCause?: string;
  estimatedImpact?: string;
  priority?: number;
  qualityScore?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {

  private readonly API_URL = 'http://localhost:8080/api';

  constructor(private http: HttpClient) { }

  getIdeias(): Observable<Idea[]> {
    return this.http.get<Idea[]>(`${this.API_URL}/ideas`).pipe(
      catchError(error => {
        console.error('Erro ao buscar ideias', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }

  // Expecting a sessionId or defaulting to a mock one if needed
  getHipoteses(sessionId: string = 'default-session'): Observable<Hypothesis[]> {
    return this.http.get<Hypothesis[]>(`${this.API_URL}/analysis-sessions/${sessionId}/hypotheses`).pipe(
      catchError(error => {
        console.error('Erro ao buscar hipóteses', error);
        return of([]); // Retorna array vazio em caso de erro
      })
    );
  }
}
