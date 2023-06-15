# Revel Digital gadget library for Angular

Angular library for building custom Revel Digital gadgets. This library simplies the player/gadget interface making it easier
to build full featured gadgets utilizing the Angular framework.

## Quickstart

**New to Angular?** [Check out the Angular documentation](https://angular.io/guide/setup-local) for getting your environment configured for development.


### **Step 1.** GitHub Repository Creation (Optional)

**Not hosting your app on Github? Skip to step #2.**

Create a new repository on [GitHub.com](https://github.com/). For more information, see "[Creating a new repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository)."


Copy your remote repository URL

![Alt text](https://reveldigital.github.io/reveldigital-client-library/images/copy-remote-repository-url-quick-setup.jpg)

```sh
git remote add origin <REMOTE_URL>
# Sets the new remote
git remote -v
# Verifies the new remote URL
```

### **Step 2.** Create a new Angular app

From within your working folder, run the following Angular CLI command using the name of your app.

```sh
ng new my-app --directory ./
# Generates the boilerplate code for a new Angular app
```

### **Step 3.** Add the Revel Digital libaries

Run the Revel Digital angular schematic which will configure your app for use as a Revel Digital gadget.

```sh
ng add @reveldigital/player-client
# Run the Revel Digital Angular schematic
```

### **Step 4.** Build

The build script will generate the Angular app along with a the gadget XML definition file.

```sh
npm run build:gadget
# Run the gadget build script
```

### **Step 5.** Deploy

The app can be hosted using any number of hosting services, however the provided schematic includes a simplified option for publishing to [GitHub Pages](https://pages.github.com/).

Assuming your working folder is associated with your GitHub repository, simply run the following command to deploy the app to the `gh-pages` branch. The gadget app and associated XML file will be publicly visibile and available for use in your signage.

```sh
npm run deploy:gagdet
# Deploy to GitHub Pages
```

## Sample usage

The majority of the functionality is contained within the [PlayerClientService](https://reveldigital.github.io/reveldigital-client-library/injectables/PlayerClientService.html). The service and supporting library exposes the following functionality:

- Methods for obtaining player details such as device time, locale, etc
- Methods for interfacting with the player including sending commands and calling into player scripting
- Player lifecycle methods (ready/start/stop)
- Gadget property accessors such as user preferences
- Miscellaneous helpers such as the SafeStyle pipe

Simply inject this service in your Angular component constructor in order to access the player client interface.

```ts
  constructor(public client: PlayerClientService) {

    this.prefs = client.getPrefs();
    
    this.style = this.prefs.getString('myStylePref');
    
    this.client.onReady$.subscribe((val) => {
      console.log(val ? 'Ready' : 'Not ready');
    });

    this.client.onCommand$.subscribe((cmd) => {
      console.log(`onCommand: ${cmd.name}, ${cmd.arg}`);
    });

    this.client.onStart$.subscribe(() => {
      console.log("onStart");
    });

    this.client.onStop$.subscribe(() => {
      console.log("onStop");
    });
  }
```

## Gadget Definition & Preferences

The `assets/gadget.yaml` file is the definition file for your gadget, responsible for defining the basic properties and features of the gadget as presented to the user. These properties include the gadget name, description, support URL, and preferences. A sample `gadgets.yaml` file is included in your project after running the schematic.

Preferences are the primary method for providing customization options of your gadget. They allow signage designers to change and preview gadget properties at design time within the Revel Digital CMS.

The following is the sample `gadgets.yaml` included with the schematic:

```yaml
title: My Gadget
title_url: https://mysupporturl.org
description: Describe the purpose of your gadget here
author: My Organization
background: transparent

requirements:
  - reveldigital
  - offline
  - webfont

locales:
  - messages: https://reveldigital.github.io/reveldigital-gadgets/ALL_ALL.xml

  - lang: ru
    messages: https://reveldigital.github.io/reveldigital-gadgets/ALL_ALL.xml

prefs:
  - name: myStringPref
    display_name: Sample string preference
    datatype: string
    default_value: test string
    required: true

  - name: myBoolPref
    display_name: Sample boolean preference
    datatype: bool
    default_value: true
    required: true
    depends:
      - name: myEnumPref
        any_of:
          - fast
          
  - name: myStylePref
    display_name: Sample style preference
    datatype: style
    default_value: font-family:Verdana;color:rgb(255, 255, 255);font-size:18px;
    required: true

  - name: myEnumPref
    display_name: Sample enum preference
    datatype: enum
    default_value: fast
    required: true
    options:
      - value: fastest
        display_value: Fastest
      - value: fast
        display_value: Fast
      - value: medium
        display_value: Medium
```

This definition file results in the following user experience when designing your gadget in a template:

![Alt text](https://reveldigital.github.io/reveldigital-client-library/images/sample-gadget-editor.png)

You will see the properties exposed in the editor which can then be modified at design time.

Individual preferences are able to be accessed in your gadget code like so:

```ts
this.prefs = client.getPrefs();
this.prefs.getString('myStringPref');
```

## Documentation

Library documentation is available here: https://reveldigital.github.io/reveldigital-client-library/

A sample Angular app is available in this repo under [projects/test-app](/projects/test-app).
