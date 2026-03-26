import { Component, OnInit } from '@angular/core';
import { UiStateService, AppView } from '../../services/ui-state.service';
import { HistoryService } from '../../services/history.service';

@Component({
  selector: 'app-history-area',
  templateUrl: './history-area.component.html',
  styleUrls: ['./history-area.component.scss']
})
export class HistoryAreaComponent implements OnInit {
  currentView: AppView = 'ideas';
  items: any[] = [];
  isLoading = false;
  hasError = false;

  constructor(
    private uiState: UiStateService,
    private historyService: HistoryService
  ) {}

  ngOnInit(): void {
    this.uiState.currentView$.subscribe(view => {
      if (view === 'ideas' || view === 'hypotheses') {
        this.currentView = view;
        this.loadData(view);
      }
    });
  }

  loadData(view: AppView) {
    this.isLoading = true;
    this.hasError = false;
    this.items = [];

    if (view === 'ideas') {
      this.historyService.getIdeias().subscribe({
        next: (data) => {
          this.items = data;
          this.isLoading = false;
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        }
      });
    } else if (view === 'hypotheses') {
      this.historyService.getHipoteses('current-session').subscribe({
        next: (data) => {
          this.items = data;
          this.isLoading = false;
        },
        error: () => {
          this.hasError = true;
          this.isLoading = false;
        }
      });
    }
  }

  goBackToChat() {
    this.uiState.setView('chat');
  }
}
