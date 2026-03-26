import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppView = 'chat' | 'ideas' | 'hypotheses';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private currentViewSubject = new BehaviorSubject<AppView>('chat');
  currentView$ = this.currentViewSubject.asObservable();

  setView(view: AppView) {
    this.currentViewSubject.next(view);
  }
}
