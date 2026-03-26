import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatService, ChatMessage } from '../../services/chat.service';

@Component({
  selector: 'app-chat-area',
  templateUrl: './chat-area.component.html',
  styleUrls: ['./chat-area.component.scss']
})
export class ChatAreaComponent implements OnInit, AfterViewChecked {
  messages$!: Observable<ChatMessage[]>;
  inputText: string = '';
  isTyping = false;
  
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    this.messages$ = this.chatService.messages$;
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }
  }

  sendMessage() {
    if (!this.inputText.trim() || this.isTyping) return;
    
    const savedInput = this.inputText;
    this.inputText = '';
    this.isTyping = true;
    
    this.chatService.processMessageFlow(savedInput).subscribe({
      next: () => {
        this.isTyping = false;
      },
      error: () => {
        this.isTyping = false;
        // The error message is already added to the stream inside ChatService
      }
    });
  }
}
