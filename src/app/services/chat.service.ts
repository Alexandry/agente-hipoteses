import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { concatMap, tap, catchError } from 'rxjs/operators';
import { UiStateService } from './ui-state.service';

export interface CardDetailed {
  title: string;
  idea: string;
  foundation: string;
}

export interface ChatMessage {
  id: number;
  isUser: boolean;
  text: string;
  timestamp: Date;
  hasCard?: boolean;
  cardData?: CardDetailed;
  isError?: boolean;
}

export interface HypothesisPayload {
  sessionId: number;
  description: string;
  associatedCause: string;
  estimatedImpact: string;
  priority: number;
  qualityScore: number;
}

export interface IdeaPayload {
  originalText: string;
  domain: string;
  context: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private readonly API_URL = 'http://localhost:8080/api';

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    {
      id: 1,
      isUser: false,
      text: 'Olá! 👋 Sou a Lupa de Ideias, uma IA multiagente especializada em transformar suas hipóteses em ideias testáveis. Como posso ajudar você hoje?\n\n• Descreva uma hipótese para eu gerar ideias\n• Defina os dados do projeto no painel lateral\n• Adicione documentos de referência para contexto adicional',
      timestamp: new Date()
    }
  ]);

  messages$: Observable<ChatMessage[]> = this.messagesSubject.asObservable();
  private nextId = 2;

  constructor(
    private http: HttpClient, 
    private uiState: UiStateService
  ) { }

  private addMessage(messageParam: Omit<ChatMessage, 'id' | 'timestamp'>) {
    const currentMessages = this.messagesSubject.getValue();
    const newMessage: ChatMessage = {
      ...messageParam,
      id: this.nextId++,
      timestamp: new Date(),
    };
    this.messagesSubject.next([...currentMessages, newMessage]);
  }

  addBotMessage(text: string) {
    this.addMessage({ isUser: false, text });
  }

  processMessageFlow(inputText: string): Observable<any> {
    const contextData = this.uiState.getContext();

    // Map the new fields to the Hypothesis payload structure
    const hypothesisPayload: HypothesisPayload = {
      sessionId: 1,
      description: inputText,
      associatedCause: contextData.whatToBeDone || "Causa não definida via premissas",
      estimatedImpact: contextData.objective || "Impacto não mapeado via objetivo",
      priority: 2, 
      qualityScore: 1.0
    };

    return this.http.post(`${this.API_URL}/hypotheses`, hypothesisPayload).pipe(
      tap(() => {
        this.addMessage({ isUser: true, text: inputText });
      }),
      concatMap((hypothesisResponse: any) => {
        // Stringify the context to Idea context
        const ideaPayload: IdeaPayload = {
          originalText: inputText,
          domain: "App",
          context: `O que será feito: ${contextData.whatToBeDone}. Para quem: ${contextData.forWhom}. Objetivo: ${contextData.objective}`
        };
        return this.http.post(`${this.API_URL}/ideas`, ideaPayload);
      }),
      tap((ideaResponse: any) => {
        const card: CardDetailed = {
          title: ideaResponse.title || ideaResponse.name || 'Nova Hipótese Analisada',
          idea: ideaResponse.originalText || ideaResponse.description || ideaResponse.idea || inputText,
          foundation: ideaResponse.context || ideaResponse.foundation || `Com foco em: ${contextData.forWhom || 'Público Geral'} visando ${contextData.objective || 'N/A'}`
        };

        this.addMessage({
          isUser: false,
          text: ideaResponse.message || 'Analisei sua solicitação com o nosso sistema back-end e preparei sua resposta testável! ✅',
          hasCard: true,
          cardData: card
        });
      }),
      catchError(error => {
        console.error('Falha na orquestração com o Back-End:', error);
        this.addMessage({
          isUser: false,
          text: 'Falha ao sincronizar com o servidor. Verifique a conexão com a API e se o backend Spring Boot localhost:8080 está rodando.',
          isError: true
        });
        return throwError(() => error);
      })
    );
  }
}
