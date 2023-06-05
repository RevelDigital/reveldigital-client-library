import { Injectable, isDevMode } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import * as yaml from "js-yaml";


@Injectable({
  providedIn: 'root'
})
export class AppInitService {

  constructor(
    public http: HttpClient,
    private _route: ActivatedRoute,
    private _router: Router) {
  }

  init(): Promise<any> {

    return new Promise<void>(async (resolve) => {
      if (isDevMode()) {
        console.log(
          '%cRunning in development mode',
          'background-color: yellow; color:red;'
        );

        /**
         * Shim the shindig prefs functionality for dev mode
         */
        (<any>window).gadgets = {

          Prefs: class {
            getString(key: string) { return this.getParameterByName(key) }

            getArray(key: string) { return this.getParameterByName(key).split(',') }

            getBool(key: string) { return !!this.getParameterByName(key) }

            getCountry() { }

            getFloat(key: string) { return parseFloat(this.getParameterByName(key)) }

            getInt(key: string) { return parseInt(this.getParameterByName(key)) }

            getLang() { return this.getParameterByName('lang') === '' ? 'en' : this.getParameterByName('lang'); }

            getParameterByName(name: string, search = window.location.href): string {

              const urlParams = new URLSearchParams(search);
              return urlParams.has(name) ? urlParams.get(name) : '';

              // name = name.replace(/[\[\]]/g, '\\$&');
              // let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
              //   results = regex.exec(search);
              // if (!results) return '';
              // if (!results[2]) return '';
              // return decodeURIComponent(results[2].replace(/\+/g, ' '));
            }
          }
        };

        this.http.get('assets/user-prefs.yml', {
          responseType: 'text'
        }).subscribe(data => {
          const doc: any = yaml.load(data);
          let params: any = {}
          for (const val of doc.prefs) {
            params[val.name] = val.default_value
          }

          this._router.navigate([], {
            relativeTo: this._route,
            queryParams: params,
          });

          console.log(
            `%cUser prefs loaded successfully`,
            'background-color:yellow; color:red;'
          );
        }, (err) => {
          console.log(
            `%cUnable to load user preferences YAML definition file: ${err}`,
            'background-color:red; color:yellow;'
          );
          console.log(
            `%cPlease see our developer documentation for help with your app configuration: https://developer.reveldigital.com`,
            'background-color:red; color:yellow;'
          )
        })
      }
      resolve();
    });
  }
}
