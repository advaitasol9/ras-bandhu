"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  AnalyticsProvider,
  AuthProvider,
  FirebaseAppProvider,
  FirestoreProvider,
  FunctionsProvider,
  StorageProvider,
  useFirebaseApp,
} from "reactfire";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { isBrowser } from "@/lib/utils";
import { getAnalytics } from "firebase/analytics";
import { FirebaseOptions } from "firebase/app";

const config: FirebaseOptions = {
  apiKey: "AIzaSyAD9kVGBT-lGrJfTdsdIOEAIRMI7S_ZuTM",
  authDomain: "ras-bandhu.firebaseapp.com",
  projectId: "ras-bandhu",
  storageBucket: "ras-bandhu.appspot.com",
  messagingSenderId: "645936493889",
  appId: "1:645936493889:web:62f0cd447409d263bfddc0",
  measurementId: "G-GH51H7LPDX",
};

const FirebaseProviderSDKs: FC<{ children: ReactNode }> = ({ children }) => {
  const firebase = useFirebaseApp();
  // we have to use getters to pass to providers, children should use hooks
  const auth = useMemo(() => getAuth(), []);
  const firestore = useMemo(() => getFirestore(firebase), []);
  const storage = useMemo(() => getStorage(firebase), []);
  const functions = useMemo(() => getFunctions(firebase), []);
  const analytics = useMemo(() => isBrowser() && getAnalytics(firebase), []);

  return (
    <>
      {auth && (
        <AuthProvider sdk={auth}>
          <FirestoreProvider sdk={firestore}>
            <StorageProvider sdk={storage}>
              <FunctionsProvider sdk={functions}>
                {/* we can only use analytics in the browser */}
                {analytics ? (
                  <AnalyticsProvider sdk={analytics}>
                    {children}
                  </AnalyticsProvider>
                ) : (
                  <>{children}</>
                )}
              </FunctionsProvider>
            </StorageProvider>
          </FirestoreProvider>
        </AuthProvider>
      )}
    </>
  );
};

export const MyFirebaseProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <>
      <FirebaseAppProvider firebaseConfig={config}>
        <FirebaseProviderSDKs>{children}</FirebaseProviderSDKs>
      </FirebaseAppProvider>
    </>
  );
};
