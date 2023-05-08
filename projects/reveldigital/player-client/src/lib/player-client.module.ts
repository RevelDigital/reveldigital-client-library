import { APP_INITIALIZER, NgModule } from '@angular/core';
import { PlayerClientService } from './player-client.service';


@NgModule({
  imports: [
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: () => initializeApp,
    deps: [PlayerClientService],
    multi: true
  }]
})
export class PlayerClientModule { }

function initializeApp(): Promise<any> {
  return new Promise((resolve, reject) => {
    PlayerClientService.init({});
    resolve(true);
  });
}
