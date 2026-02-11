import { Injectable, enableProdMode, isDevMode } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ActivatedRoute, Router } from "@angular/router";
import * as yaml from "js-yaml";
import * as WebFont from 'webfontloader';

const isLocal: boolean = /localhost/.test(document.location.host);
!isLocal && enableProdMode();


/** @ignore */
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

      this.loadFonts();

      if (isDevMode()) {
        console.log(
          '%cRunning in development mode',
          'background-color:blue; color:yellow;'
        );

        /**
         * Shim the shindig prefs functionality for dev mode
         */
        (<any>window).gadgets = {

          Prefs: class {
            getString(key: string) { return this.getParameterByName(key) }

            getArray(key: string) { return this.getParameterByName(key).split(',') }

            getBool(key: string) { return this.getParameterByName(key) === 'true' }

            getCountry() { }

            getFloat(key: string) { return parseFloat(this.getParameterByName(key)) }

            getInt(key: string) { return parseInt(this.getParameterByName(key)) }

            getLang() { return this.getParameterByName('lang') === '' ? 'en' : this.getParameterByName('lang'); }

            getParameterByName(name: string, search = window.location.href): string {

              name = name.replace(/[\[\]]/g, '\\$&');
              let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
                results = regex.exec(search);
              if (!results) return '';
              if (!results[2]) return '';
              return decodeURIComponent(results[2].replace(/\+/g, ' '));
            }
          }
        };

        this.http.get('assets/gadget.yaml', {
          responseType: 'text'
        }).subscribe({
          next: (data) => {
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
              'background-color:blue; color:yellow;'
            );
          },
          error: (err) => {
            console.log(
              `%cUnable to load user preferences YAML definition file: ${err}`,
              'background-color:blue; color:yellow;'
            );
            console.log(
              `%cPlease see our developer documentation for help with your app configuration: https://developer.reveldigital.com`,
              'background-color:red; color:yellow;'
            )
          }
        })
      }
      resolve();
    });
  }


  private getFamilyName(css) {

    let FONT_FAMILY_REGEX = /font-family:\s*(?:[&#39;&#34;])*['"]*(.+?)['"]*(?:[&#39;&#34;])*\s*;/i;
    if (FONT_FAMILY_REGEX.test(css)) {
      var matches = css.match(FONT_FAMILY_REGEX);
      return matches[1].split(',')[0];
    } else {
      return '';
    }
  }

  /**
   * Loads the given font from Google Web Fonts.
   */
  private loadFonts(): void {

    const parameters = new URLSearchParams(window.location.search);
    parameters.forEach((val, key) => {
      try {
        let fontFamily = this.getFamilyName(val);
        if (fontFamily !== '') {
          WebFont.load({
            google: {
              families: [fontFamily]
            },
            fontactive: (familyName) => {
              console.log(`%cActivating font: ${familyName}`,
                'background-color:blue; color:yellow;');
            },
            fontinactive: (familyName) => {
              console.log(`%cFont inactive: ${familyName}`,
                'background-color:red; color:yellow;');
            }
          });
        }
      } catch (e) {
      }
    });
  }
}
