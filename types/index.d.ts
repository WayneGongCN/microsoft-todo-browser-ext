import { AuthenticationResult } from '@azure/msal-browser';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/ban-types
    ga: Function;
    __IS_DEV: boolean;
    __IS_PROD: boolean;
    __VERSION: string;
    __TARGET: string;
  }
}


type Modify<T, R> = Omit<T, keyof R> & R;

type SerializAuthenticationResult = Modify<
  AuthenticationResult,
  {
    expiresOn: number;
    extExpiresOn: number;
  }
>;
