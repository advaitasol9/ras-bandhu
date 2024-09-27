"use client";

import React, {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useFirebaseApp, useFirestore, useFunctions } from "reactfire";
import {
  getAuth,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdTokenResult,
} from "firebase/auth";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import moment from "moment";

interface UserContextType {
  user: FirebaseUser | null;
  userData: any | null;
  subscriptionData: any | null;
  hasActiveSubscription: boolean;
  isMentor: boolean;
  isAdmin: boolean;
  appData: any | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  subscriptionData: null,
  hasActiveSubscription: false,
  isMentor: false,
  isAdmin: false,
  appData: null,
  loading: true,
});

export const useUserContext = () => useContext(UserContext);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const firebase = useFirebaseApp();
  const auth = getAuth(firebase);
  const firestore = useFirestore();
  const functions = useFunctions();

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isMentor, setIsMentor] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<any | null>(null);
  const [appData, setAppData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const currentTime = new Date();
  const subscriptionExpiry = subscriptionData
    ? new Date(subscriptionData?.subscriptionExpiry)
    : null;
  const hasActiveSubscription =
    !!subscriptionExpiry && currentTime < subscriptionExpiry;
  const isAdmin = !!user?.uid && !!appData?.admin && appData.admin == user.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userDocRef = doc(firestore, "Users", firebaseUser.uid);

        const unsubscribeUserDoc = onSnapshot(
          userDocRef,
          async (docSnapshot) => {
            if (docSnapshot.exists()) {
              setUserData(docSnapshot.data());
            } else {
              const userDocData = {
                name: "",
                phone: firebaseUser.phoneNumber,
                email: "",
                authMethod:
                  firebaseUser.providerData[0]?.providerId || "unknown",
                createdAt: moment().toISOString(),
              };
              await setDoc(userDocRef, userDocData);
              setUserData(userDocData);
            }
            setLoading(false);
          }
        );

        const idTokenResult = await getIdTokenResult(firebaseUser);
        const claims = idTokenResult.claims;
        if (claims) {
          console.log("claims", JSON.stringify(claims));
          setIsMentor(!!claims.mentor);
        }

        return () => unsubscribeUserDoc();
      } else {
        setIsMentor(false);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  useEffect(() => {
    const userDocRef = doc(firestore, "Bootstrap", "1NMCvUffRGigy2bhzF0R");
    getDoc(userDocRef)
      .then((snap) => setAppData(snap.data()))
      .catch((err) => console.log("err", err));
  }, []);

  useEffect(() => {
    if (user) {
      const userSubArrayRef = doc(
        firestore,
        "userSubArrayscriptions",
        user.uid
      );
      const unsubscribeuserSubArrayDoc = onSnapshot(
        userSubArrayRef,
        async (docSnapshot) => {
          if (docSnapshot.exists()) {
            setSubscriptionData(docSnapshot.data());
          }
        }
      );

      return () => unsubscribeuserSubArrayDoc();
    }
  }, [user]);

  const resetCreditsIfNeeded = async () => {
    try {
      const currentTime = moment();
      const lastCreditReset = subscriptionData.lastCreditReset
        ? moment(subscriptionData.lastCreditReset)
        : null;

      if (!lastCreditReset || !lastCreditReset.isSame(currentTime, "day")) {
        await httpsCallable(functions, "checkAndResetCredits")();
      }
    } catch (err) {
      console.log("error", err);
    }
  };

  useEffect(() => {
    if (
      user &&
      subscriptionData &&
      subscriptionData?.subscriptionPlan != "trial"
    )
      resetCreditsIfNeeded();
  }, [user, subscriptionData]);

  return (
    <UserContext.Provider
      value={{
        user,
        userData,
        subscriptionData,
        hasActiveSubscription,
        isMentor,
        isAdmin,
        appData,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
