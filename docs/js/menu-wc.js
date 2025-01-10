'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">reveldigital-client-library documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/NgSafeStylePipeModule.html" data-type="entity-link" >NgSafeStylePipeModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-NgSafeStylePipeModule-9f971a30daedbfaba64adf2088559512392dfc25e6cb5b1c9577e8bfda42b0949f67a9421ef2989776c49b4e71bcd4fe879bb981cbd113ce2282726ebe63b34a"' : 'data-bs-target="#xs-pipes-links-module-NgSafeStylePipeModule-9f971a30daedbfaba64adf2088559512392dfc25e6cb5b1c9577e8bfda42b0949f67a9421ef2989776c49b4e71bcd4fe879bb981cbd113ce2282726ebe63b34a"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-NgSafeStylePipeModule-9f971a30daedbfaba64adf2088559512392dfc25e6cb5b1c9577e8bfda42b0949f67a9421ef2989776c49b4e71bcd4fe879bb981cbd113ce2282726ebe63b34a"' :
                                            'id="xs-pipes-links-module-NgSafeStylePipeModule-9f971a30daedbfaba64adf2088559512392dfc25e6cb5b1c9577e8bfda42b0949f67a9421ef2989776c49b4e71bcd4fe879bb981cbd113ce2282726ebe63b34a"' }>
                                            <li class="link">
                                                <a href="pipes/SafeStylePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SafeStylePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/PlayerClientModule.html" data-type="entity-link" >PlayerClientModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-PlayerClientModule-3b9e1b7bb910346fadc3c08a9657c4b1da7678c8935f067700e32317d70d52f413995df56842b6d6e5d4880c1aa84b5e616ab52ecbb46d45d5d8a69b1562e996"' : 'data-bs-target="#xs-pipes-links-module-PlayerClientModule-3b9e1b7bb910346fadc3c08a9657c4b1da7678c8935f067700e32317d70d52f413995df56842b6d6e5d4880c1aa84b5e616ab52ecbb46d45d5d8a69b1562e996"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-PlayerClientModule-3b9e1b7bb910346fadc3c08a9657c4b1da7678c8935f067700e32317d70d52f413995df56842b6d6e5d4880c1aa84b5e616ab52ecbb46d45d5d8a69b1562e996"' :
                                            'id="xs-pipes-links-module-PlayerClientModule-3b9e1b7bb910346fadc3c08a9657c4b1da7678c8935f067700e32317d70d52f413995df56842b6d6e5d4880c1aa84b5e616ab52ecbb46d45d5d8a69b1562e996"' }>
                                            <li class="link">
                                                <a href="pipes/SafeStylePipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SafeStylePipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/PlayerClientService.html" data-type="entity-link" >PlayerClientService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ICommand.html" data-type="entity-link" >ICommand</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IConfig.html" data-type="entity-link" >IConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDevice.html" data-type="entity-link" >IDevice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDictionary.html" data-type="entity-link" >IDictionary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEventProperties.html" data-type="entity-link" >IEventProperties</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ILocation.html" data-type="entity-link" >ILocation</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});