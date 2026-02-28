import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
import { PlayerClientService } from './player-client.service';
import { AppInitService } from './app-init.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { APP_BASE_HREF } from '@angular/common';
import { NgSafeStylePipeModule } from './safe-style.pipe';

declare const gadgets: any;


@NgModule({
  imports: [
    HttpClientModule,
    RouterModule.forRoot([]),
    NgSafeStylePipeModule
  ],
  exports: [
    NgSafeStylePipeModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: initializeApp,
    deps: [AppInitService, PlayerClientService],
    multi: true
  },
  {
    provide: LOCALE_ID,
    useFactory: () => {
      try {
        return new gadgets.Prefs().getLang();
      } catch {
        return 'en';
      }
    }
  },
  { provide: APP_BASE_HREF, useValue: '/gadgets/ifr' }]
})
export class PlayerClientModule { }

function initializeApp(appInitService: AppInitService) {
  return async () => {
    PlayerClientService.init({});
    await appInitService.init();
  }
}
