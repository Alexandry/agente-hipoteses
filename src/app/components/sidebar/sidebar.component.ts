import { Component } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { UiStateService } from '../../services/ui-state.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  whatToBeDone: string = '';
  forWhom: string = '';
  objective: string = '';

  constructor(
    private chatService: ChatService,
    private uiState: UiStateService
  ) {}

  saveContext() {
    this.uiState.setContext(this.whatToBeDone, this.forWhom, this.objective);
    this.chatService.addBotMessage('Contexto do projeto atualizado! Essas informações serão enviadas para a IA na sua próxima requisição visando aprimorar os resultados.');
  }

  goToIdeias() {
    this.uiState.setView('ideas');
  }

  goToHipoteses() {
    this.uiState.setView('hypotheses');
  }
}
