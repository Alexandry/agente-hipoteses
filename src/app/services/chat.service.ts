import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { concatMap, tap, catchError, map } from 'rxjs/operators';
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
  // URLs Desacopladas
  private readonly DB_API_URL = 'http://localhost:8080/api'; // Persistência de Ideias e Hipóteses
  private readonly AGENT_API_URL = 'http://localhost:5000/agent'; // Substitua pela URL real do Agente GenAI

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

    const hypothesisPayload: HypothesisPayload = {
      sessionId: 1,
      description: inputText,
      associatedCause: contextData.whatToBeDone || "Causa não definida via premissas",
      estimatedImpact: contextData.objective || "Impacto não mapeado via objetivo",
      priority: 2, 
      qualityScore: 1.0
    };

    // 1. Salva Hipótese
    return this.http.post(`${this.DB_API_URL}/hypotheses`, hypothesisPayload).pipe(
      tap(() => {
        this.addMessage({ isUser: true, text: inputText });
      }),
      // 2. Chama o Agente passando os dados
      concatMap((hypothesisResponse: any) => {
        const agentPayload = {
          input: inputText,
          context: `O que será feito: ${contextData.whatToBeDone}. Para quem: ${contextData.forWhom}. Objetivo: ${contextData.objective}`
        };
        return this.http.post(`${this.AGENT_API_URL}/generate`, agentPayload);
      }),
      // 3. O Agente retornou, agora persista a Ideia Base gerada por ele
      concatMap((agentResponse: any) => {
        const ideaPayload: IdeaPayload = {
          originalText: agentResponse.resultado || agentResponse.idea || inputText,
          domain: "App",
          context: `O que será feito: ${contextData.whatToBeDone}`
        };
        
        // Retorna um mapeamento com as duas respostas pra usar na montagem final da UI
        return this.http.post(`${this.DB_API_URL}/ideas`, ideaPayload).pipe(
          map(ideaResponse => ({ agentResponse, ideaResponse }))
        );
      }),
      // 4. Monta o Card com a resposta consolidada
      tap(({ agentResponse, ideaResponse }: any) => {
        const card: CardDetailed = {
          title: ideaResponse.title || agentResponse.title || 'Nova Ideia Gerada',
          idea: ideaResponse.originalText || agentResponse.resultado || agentResponse.idea || inputText,
          foundation: agentResponse.foundation || ideaResponse.context || `Foco em: ${contextData.forWhom || 'Público Geral'} visando ${contextData.objective || 'N/A'}`
        };

        this.addMessage({
          isUser: false,
          text: agentResponse.message || 'Analisei sua solicitação com nossa IA e preparei sua reposta estruturada! ✅',
          hasCard: true,
          cardData: card
        });
      }),
      catchError(error => {
        console.error('Falha na orquestração (DB ou Agente):', error);
        this.addMessage({
          isUser: false,
          text: 'Falha ao sincronizar. Verifique se o Back-End (8080) e o Agente GenAI estão rodando corretamente.',
          isError: true
        });
        return throwError(() => error);
      })
    );
  }
}
