import { initializeApp, cert } from 'firebase-/app';
import { getFirestore, AggregateField } from 'firebase-/firestore';
import fs from 'fs';

// Try to find a service account key or initialize with default if possible.
// Actually, I don't have the service account key for 'losbutik'.
console.log("Cannot run without service account key.");
