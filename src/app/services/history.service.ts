import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface Idea {
  id?: number;
  originalText?: string;
  domain?: string;
  context?: string;
  structuredSummary?: string;
  problemStatement?: string;
  proposedSolution?: string;
  targetAudience?: string;
  initialAssumptions?: string;
  gapsAndAmbiguities?: string;
  createdAt?: string;
  [key: string]: any;
}

export interface Hypothesis {
  id?: number;
  sessionId?: number;
  description?: string;
  hypothesisType?: string;
  rationale?: string;
  relevantVariables?: string;
  sourceReference?: string;
  strengthLabel?: string;
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
        return of([]); 
      })
    );
  }

  getHipoteses(sessionId: string = '1'): Observable<Hypothesis[]> {
    return this.http.get<Hypothesis[]>(`${this.API_URL}/hypotheses`).pipe(
      catchError(error => {
        console.error('Erro ao buscar hipóteses', error);
        return of([]); 
      })
    );
  }
}
