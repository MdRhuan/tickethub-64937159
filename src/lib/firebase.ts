import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            'AIzaSyDXx7JPS2oOiDEmMlf5nnkUYEvubWoT4s8',
  authDomain:        'tickethubbh.firebaseapp.com',
  projectId:         'tickethubbh',
  storageBucket:     'tickethubbh.firebasestorage.app',
  messagingSenderId: '121014876387',
  appId:             '1:121014876387:web:30408ae3e045be87642dd6',
  measurementId:     'G-GHT9ZLMV35',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
