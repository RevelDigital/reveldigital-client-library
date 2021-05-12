import { Component, OnInit } from '@angular/core';
import { PlayerClientService } from '@reveldigital/player-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'test-app';
  localTime: any;
  deviceTime: any;
  TZName: any;
  TZId: any;
  TZOffset: any;
  langCode: any;
  deviceKey: any;
  revelRoot: any;
  remoteDeviceKey: any;


  constructor(public client: PlayerClientService) {

    this.client.onCommand$.subscribe((cmd) => {
      console.log(`Got command: ${cmd.name}, ${cmd.arg}`);
    });
  }

  ngOnInit(): void {

    setInterval(() => {
      this.update();
    }, 1000);
  }

  update() {

    this.client.getDeviceTime().then((res) => {
      this.localTime = new Date();
      this.deviceTime = new Date(res);
    });

    this.client.getDeviceTimeZoneName().then((res) => {
      this.TZName = res;
    });

    this.client.getDeviceTimeZoneID().then((res) => {
      this.TZId = res;
    })

    this.client.getDeviceTimeZoneOffset().then((res) => {
      this.TZOffset = res;
    });

    this.client.getLanguageCode().then((res) => {
      this.langCode = res;
    });

    this.client.getDeviceKey().then((res) => {
      this.deviceKey = res;
    });

    this.client.getRevelRoot().then((res) => {
      this.revelRoot = res;
    })

  }

  sendCommand() {

    this.client.sendCommand("test", "it");
  }

  sendRemoteCommand() {

    this.client.sendRemoteCommand([this.remoteDeviceKey], "test", "it");
  }

  trackEvent() {

    this.client.track("test", { "a": "b" });
  }

  callback() {

    this.client.callback('test');
  }
}
