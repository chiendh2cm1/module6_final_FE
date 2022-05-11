// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiURL: 'http://localhost:8081/',
  api_url: 'http://localhost:8080/',
  firebaseConfig: {
    apiKey: "AIzaSyD9P8dOuqTRKL-Esc-25coo9P0XqDO7cLo",
    authDomain: "trello-h3k.firebaseapp.com",
    databaseURL: "https://trello-h3k-default-rtdb.firebaseio.com",
    projectId: "trello-h3k",
    storageBucket: "trello-h3k.appspot.com",
    messagingSenderId: "288253371925",
    appId: "1:288253371925:web:a5c0621a1099eb0540d01c",
    measurementId: "G-QK8W4RFSJT"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
