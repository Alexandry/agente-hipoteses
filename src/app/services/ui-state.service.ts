import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppView = 'chat' | 'ideas' | 'hypotheses';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private currentViewSubject = new BehaviorSubject<AppView>('chat');
  currentView$ = this.currentViewSubject.asObservable();

  private premisesSubject = new BehaviorSubject<string>('');
  private targetAudienceSubject = new BehaviorSubject<string>('');

  setView(view: AppView) {
    this.currentViewSubject.next(view);
  }

  setContext(premises: string, targetAudience: string) {
    this.premisesSubject.next(premises);
    this.targetAudienceSubject.next(targetAudience);
  }

  getContext() {
    return {
      premises: this.premisesSubject.getValue(),
      targetAudience: this.targetAudienceSubject.getValue()
    };
  }
}
