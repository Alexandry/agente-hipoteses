import { Component } from '@angular/core';
import { UiStateService } from '../../services/ui-state.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {

  constructor(
    private uiState: UiStateService
  ) {}

  goToIdeias() {
    this.uiState.setView('ideas');
  }

  goToHipoteses() {
    this.uiState.setView('hypotheses');
  }
}
