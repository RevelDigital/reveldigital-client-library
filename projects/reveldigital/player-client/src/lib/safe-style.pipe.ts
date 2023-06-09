import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

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
