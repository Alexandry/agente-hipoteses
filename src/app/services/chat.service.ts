import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, forkJoin } from 'rxjs';
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
  hypothesisType: string;
  rationale: string;
  relevantVariables: string;
  sourceReference: string;
  strengthLabel: string;
  associatedCause: string;
  estimatedImpact: string;
  priority: number;
  qualityScore: number;
}

export interface IdeaPayload {
  originalText: string;
  domain: string;
  context: string;
  structuredSummary: string;
  problemStatement: string;
  proposedSolution: string;
  targetAudience: string;
  initialAssumptions: string;
  gapsAndAmbiguities: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // URLs Desacopladas
  private readonly DB_API_URL = 'http://localhost:8080/api'; // Persistência de Ideias e Hipóteses
  private readonly AGENT_API_URL = 'http://localhost:5000/agent'; // URL da IA

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([
    {
      id: 1,
      isUser: false,
      text: 'Olá! 👋 Sou a Lupa de Ideias, uma IA multiagente especializada em transformar suas hipóteses em ideias testáveis.<br><br>Por favor, envie-me na sua mensagem uma ideia guiada pelas perguntas estruturais:<br><br>• <b>O que será feito?</b> <span class="context-example">(Ex: melhorar o tempo de resposta da análise de crédito)</span><br>• <b>Para quem será feito?</b> <span class="context-example">(Ex: clientes que possuem serviços com o BV)</span><br>• <b>Objetivo / resultado esperado</b> <span class="context-example">(Ex: manter um relacionamento duradouro com o cliente)</span>',
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

    // Optimistic Update: Coloca a mensagem na interface logo!
    this.addMessage({ isUser: true, text: inputText });

    // 1. Invoca o Agente com a mensagem do Usuário
    const agentReqPayload = { 
      session_id: 1,
      user_id: "user123", /* Configurado previamente para o backend Python */ 
      question: inputText 
    };

    return this.http.post(`${this.AGENT_API_URL}/generate`, agentReqPayload).pipe(
      
      /* 
       ************************************************************************
       * TRECHO COMENTADO: Persistência no Back-End de Ideias/Hipóteses via REST
       ************************************************************************
      concatMap((agentResponse: any) => {
        // Separatriz de DTO: IDEIA
        const ideaPayload: IdeaPayload = {
          originalText: agentResponse.resposta || agentResponse.originalText || inputText,
          domain: agentResponse.domain || "App Geral",
          context: agentResponse.context || "Extraído da conversa via Chat",
          structuredSummary: agentResponse.structuredSummary || "",
          problemStatement: agentResponse.problemStatement || "",
          proposedSolution: agentResponse.proposedSolution || "",
          targetAudience: agentResponse.targetAudience || "",
          initialAssumptions: agentResponse.initialAssumptions || "",
          gapsAndAmbiguities: agentResponse.gapsAndAmbiguities || ""
        };

        // Separatriz de DTO: HIPÓTESE
        const hypothesisPayload: HypothesisPayload = {
          sessionId: 1, 
          description: agentResponse.description || inputText,
          hypothesisType: agentResponse.hypothesisType || "Behavioral",
          rationale: agentResponse.rationale || "Definido pela IA com base nas premissas",
          relevantVariables: agentResponse.relevantVariables || "",
          sourceReference: agentResponse.sourceReference || "Sistema Multiagente Lupa",
          strengthLabel: agentResponse.strengthLabel || "MODERATE",
          associatedCause: agentResponse.associatedCause || "Informado via chat",
          estimatedImpact: agentResponse.estimatedImpact || "MEDIUM",
          priority: agentResponse.priority || 2,
          qualityScore: agentResponse.qualityScore || 0.8
        };
        return forkJoin({
          ideaDbResponse: this.http.post(`${this.DB_API_URL}/ideas`, ideaPayload),
          hypothesisDbResponse: this.http.post(`${this.DB_API_URL}/hypotheses`, hypothesisPayload)
        }).pipe(
          map(dbResults => ({ agentResponse, dbResults }))
        );
      }),
      */

      // 2. O Agente retornou direto! Construa a visualização para o Front-End imediatamente
      tap((agentResponse: any) => {
        const card: CardDetailed = {
          title: agentResponse.hypothesisType || 'Nova Estrutura Consolidada',
          idea: agentResponse.resposta || agentResponse.proposedSolution || agentResponse.structuredSummary || inputText,
          foundation: agentResponse.rationale || agentResponse.problemStatement || `Análise gerada e entregue na interface via simulação direta.`
        };

        this.addMessage({
          isUser: false,
          text: agentResponse.resposta || 'A Lupa finalizou a orquestração! Analisei os campos textuais de imediato sem salvar os rastros no banco de dados. 🚀',
          hasCard: true,
          cardData: card
        });
      }),

      catchError(error => {
        console.error('Falha na orquestração GenAI:', error);
        this.addMessage({
          isUser: false,
          text: 'Falha durante o processo do Agente IA. Verifique se ele está rodando na porta 5000.',
          isError: true
        });
        return throwError(() => error);
      })
    );
  }
}
