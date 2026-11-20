
import { createRequire } from "node:module";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const require = createRequire(import.meta.url);

const serviceAccount = require("../firebase-service-account.json");

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert(serviceAccount),
        projectId: "candyapp-f159f",
      });

export const firebaseAdminAuth = getAuth(app);
