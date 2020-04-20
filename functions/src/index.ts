import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import currentsApi from './api/currentsApi';

admin.initializeApp();

exports.currents = functions.https.onRequest(currentsApi);