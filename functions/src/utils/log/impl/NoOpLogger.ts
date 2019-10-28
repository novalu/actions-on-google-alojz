import { Logger } from "../Logger";

class NoOpLogger implements Logger {
  public debug(body: any, extra?: any) {
    // no-op
  }

  public error(body: any, extra?: any) {
    // no-op
  }

  public info(body: any, extra?: any) {
    // no-op
  }

  public trace(body: any, extra?: any) {
    // no-op
  }

  public warn(body: any, extra?: any) {
    // no-op
  }

  public fatal(body: any, extra?: any) {
    // no-op
  }
}

export { NoOpLogger };
