import { Component, OnInit } from '@angular/core';
import { PlayerClientService } from '@reveldigital/player-client';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'test-app';
  state = 'Not ready';
  localTime: any;
  deviceTime: any;
  TZName: any;
  TZId: any;
  TZOffset: any;
  langCode: any;
  deviceKey: any;
  revelRoot: any;
  remoteDeviceKey: any;
  commandMap: any;
  prefs: any;
  style: any;
  width: any;
  height: any;
  duration: any;
  version: any;
  isPreviewMode: any;

  //prefs = new gadgets.Prefs();


  constructor(public client: PlayerClientService) {

    this.prefs = client.getPrefs();

    this.style = this.prefs.getString('myStylePref');

    this.client.onReady$.subscribe((val) => {
      console.log(val ? 'Ready' : 'Not ready');
      this.state = val ? 'Ready' : 'Not ready';
    });

    this.client.onCommand$.subscribe((cmd) => {
      console.log(`onCommand: ${cmd.name}, ${cmd.arg}`);
    });

    this.client.onStart$.subscribe(() => {
      console.log("onStart");
      this.state = 'Started';
    });

    this.client.onStop$.subscribe(() => {
      console.log("onStop");
      this.state = 'Stopped';
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
    });

    this.client.getCommandMap().then((res) => {
      this.commandMap = res;
    });

    this.client.getWidth().then((res) => {
      this.width = res;
    });

    this.client.getHeight().then((res) => {
      this.height = res;
    });

    this.client.getDuration().then((res) => {
      this.duration = res;
    });

    this.client.getSdkVersion().then((res) => {
      this.version = res;
    });

    this.client.isPreviewMode().then((res) => {
      this.isPreviewMode = res;
    });
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

  finish() {

    this.client.finish();
  }
}
