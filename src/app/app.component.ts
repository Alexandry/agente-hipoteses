import { Component, OnInit } from '@angular/core';
import { UiStateService, AppView } from './services/ui-state.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentView: AppView = 'chat';

  constructor(private uiState: UiStateService) {}

  ngOnInit() {
    this.uiState.currentView$.subscribe(view => {
      this.currentView = view;
    });
  }
}
