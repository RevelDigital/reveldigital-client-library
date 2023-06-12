import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * The safe style pipe is used when custom styles are defined for a gadget and must be applied to an Angular
 * component. This pipe will ensure the style can be appied safely by utilizing the DomSanitizer.
 * 
 * @example
 * <h2 [style]="style | safeStyle">Sample Pref: {{ prefs.getString('myStringPref') }}</h2>
 */
@Pipe({
    name: 'safeStyle',
})
export class SafeStylePipe implements PipeTransform {
    constructor(private sanitized: DomSanitizer) { }

    transform(value: any): unknown {
        return this.sanitized.bypassSecurityTrustStyle(value);
    }
}

@NgModule({
    declarations: [SafeStylePipe],
    exports: [SafeStylePipe],
})
export class NgSafeStylePipeModule { }
