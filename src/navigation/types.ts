import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Cadastro: undefined;
  ForgotPassword: undefined;
};

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  NewPayment: { commitmentId?: string } | undefined;
  EditPayment: { id: string };
  Payments: undefined;
  Reports: undefined;
  NewGroup: { id?: string } | undefined;
  EditGroup: { id: string };
  GroupDetail: { id: string };
  NewCommitment: { id?: string } | undefined;
  CommitmentDetail: { id: string };
  Profile: undefined;
  EditProfile: undefined;
  History: undefined;
  Support: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  Commitments: undefined;
  Payments: undefined;
  Reports: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
