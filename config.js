import firebase from'firebase'
require('@firebase/firestore');
const firebaseConfig = {
    apiKey: "AIzaSyBUAEqFCQaCy7MODFU6jDVhooZ4PQqdXuk",
    authDomain: "willly-97ca7.firebaseapp.com",
    databaseURL: "https://willly-97ca7.firebaseio.com",
    projectId: "willly-97ca7",
    storageBucket: "willly-97ca7.appspot.com",
    messagingSenderId: "49374639839",
    appId: "1:49374639839:web:7ed8671239a57c0cef9b6a"
  };

  firebase.initializeApp(firebaseConfig)

  export default firebase.firestore();