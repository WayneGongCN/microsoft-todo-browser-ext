import { SerializError } from "../../types";


export enum ErrorCode {
  UNKNOW = -1,
}


export default class AppError extends Error {
  code: ErrorCode;
  time: number;


  constructor({ code, message }: { code: ErrorCode; message: string }) {
    super(message);

    this.time = Date.now();
    this.code = code;
  }


  serializ(): SerializError {
    return {
      code: this.code,
      message: this.message,
      stack: this.stack,
      time: this.time
    }
  }
}
