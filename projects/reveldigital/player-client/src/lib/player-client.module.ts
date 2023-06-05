import { APP_INITIALIZER, NgModule } from '@angular/core';
import { PlayerClientService } from './player-client.service';
import { AppInitService } from './app-init.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';


@NgModule({
  imports: [
    HttpClientModule,
    RouterModule.forRoot([])
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeApp,
    deps: [AppInitService, PlayerClientService],
    multi: true
  }]
})
export class PlayerClientModule { }

function initializeApp(appInitService: AppInitService) {
  return async () => {
    PlayerClientService.init({});
    await appInitService.init();
  }
}
