export type Evaluation = {
  id: string;
  userId: string;
  paper?: string;
  subject: string;
  subjects?: string[];
  createdAt: string;
  type: string;
  numberOfAnswers: number;
  containsPyq?: boolean;
  studentComment?: string;
  status: "Pending" | "Assigned" | "Evaluated" | "Rejected";
  files: { url: string; type: string }[];
  mentorAssigned?: string;
  mentorComments?: string;
  mentorEvaluationUrl?: string;
  rejectReason?: string;
  review?: {
    rating: number;
    feedback: string;
    feedbackImages: string[];
  };
  assignedAt?: string;
  evaluatedAt?: string;
};

export type Plan = {
  id: string;
  name: string;
  duration: number;
  features: string[];
  price: number;
  discountedPrice: number;
  isVisible: boolean;
  openForAdmission: boolean;
  seatsLeft: number;
  parentSection: string;
  medium: string;
  isTrial: boolean;
  creditsPerDay?: number; // For dailyEvaluation
  totalCredits?: number; // For testEvaluation
  admissions?: number;
  revenue?: number;
};

export type UserSubInfo = {
  id: string;
  name: string;
  duration: number;
  features: string[];
  price: number;
  discountedPrice?: number;
  parentSection: string;
  medium: string;
  creditsPerDay: number;
  totalCredits?: number;
};

export const emptyUserSubInfo = {
  id: "",
  name: "",
  duration: 0,
  features: [],
  price: 0,
  discountedPrice: 0,
  parentSection: "",
  medium: "",
  creditsPerDay: 0,
  totalCredits: 0,
};

// Define the structure of the subscription data
export type DailyEvaluationSubscription = {
  id?: string;
  creditsRemaining: number;
  lastCreditReset: string | null;
  subscriptionExpiry: string;
  subscriptionPlan: string;
  userId: string;
  userInfo?: {
    name?: string;
    phone?: string;
    email?: string;
    avatarUrl?: string;
  };
  subInfo: UserSubInfo;
};

export const emptyDailyEvaluationSubscription = {
  creditsRemaining: 0,
  lastCreditReset: "",
  subscriptionExpiry: "",
  subscriptionPlan: "",
  userId: "",
  subInfo: emptyUserSubInfo,
};

export interface TestEvaluationSubscription {
  id?: string;
  subscriptionPlan: string;
  creditsRemaining: number;
  subscriptionExpiry: string;
  lastCreditUsed: string | null;
  userId: string;
  subInfo: UserSubInfo;
  createdAt: string;
}

export const emptyTestEvaluationSubscription = {
  creditsRemaining: 0,
  lastCreditReset: "",
  subscriptionExpiry: "",
  subscriptionPlan: "",
  userId: "",
  subInfo: emptyUserSubInfo,
};

export type TestEvaluation = {
  id: string;
  userId: string;
  paper: string;
  subject?: string;
  subjects: string[];
  createdAt: string;
  type: string;
  numberOfAnswers: number;
  containsPyq?: boolean;
  studentComment?: string;
  status: "Pending" | "Assigned" | "Evaluated" | "Rejected";
  file: { url: string; type: string };
  mentorAssigned?: string;
  mentorComments?: string;
  mentorEvaluationUrl?: string;
  rejectReason?: string;
  review?: {
    rating: number;
    feedback: string;
    feedbackImages: string[];
  };
  assignedAt?: string;
  evaluatedAt?: string;
};

export type User = {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
};

export const tabSubCollectionMapping: { [key: string]: string } = {
  dailyEval: "DailyEvalSubscriptions",
  testEval: "TestEvalSubscriptions",
};

export const tabEvalReqCollectionMapping: { [key: string]: string } = {
  dailyEval: "DailyEvalRequests",
  testEval: "TestEvalRequests",
};

export const tabRouteMapping: { [key: string]: string } = {
  dailyEval: "daily-evaluations",
  testEval: "test-evaluations",
};

export interface AlertButton {
  text: string;
  onPress?: () => void;
}

export interface AlertData {
  title: string;
  message: string;
  buttons?: AlertButton[]; // Make buttons optional
}

export type AlertListener = (data: AlertData) => void;
