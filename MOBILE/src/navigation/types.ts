/**
 * Navigation Types
 * Type definitions for navigation params
 */

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Visitors: undefined;
  PreRegister: undefined;
  QRScan: undefined;
  Profile: undefined;
};

export type DashboardStackParamList = {
  DashboardHome: undefined;
  VisitorDetail: { sessionId: string };
};

export type VisitorsStackParamList = {
  VisitorsList: undefined;
  VisitorDetail: { sessionId: string };
};

export type PreRegisterStackParamList = {
  PreRegisterList: undefined;
  PreRegisterForm: undefined;
  PreRegisterDetail: { id: string };
};

export type QRScanStackParamList = {
  QRScan: undefined;
  QRResult: { sessionId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  ChangePassword: undefined;
};
