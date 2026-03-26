import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ChatAreaComponent } from './components/chat-area/chat-area.component';
import { ChatMessageComponent } from './components/chat-message/chat-message.component';
import { HistoryAreaComponent } from './components/history-area/history-area.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    ChatAreaComponent,
    ChatMessageComponent,
    HistoryAreaComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
