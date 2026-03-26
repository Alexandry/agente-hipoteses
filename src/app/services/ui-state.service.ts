import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type AppView = 'chat' | 'ideas' | 'hypotheses';

@Injectable({
  providedIn: 'root'
})
export class UiStateService {
  private currentViewSubject = new BehaviorSubject<AppView>('chat');
  currentView$ = this.currentViewSubject.asObservable();

  private whatToBeDoneSubject = new BehaviorSubject<string>('');
  private forWhomSubject = new BehaviorSubject<string>('');
  private objectiveSubject = new BehaviorSubject<string>('');

  setView(view: AppView) {
    this.currentViewSubject.next(view);
  }

  setContext(whatToBeDone: string, forWhom: string, objective: string) {
    this.whatToBeDoneSubject.next(whatToBeDone);
    this.forWhomSubject.next(forWhom);
    this.objectiveSubject.next(objective);
  }

  getContext() {
    return {
      whatToBeDone: this.whatToBeDoneSubject.getValue(),
      forWhom: this.forWhomSubject.getValue(),
      objective: this.objectiveSubject.getValue()
    };
  }
}
