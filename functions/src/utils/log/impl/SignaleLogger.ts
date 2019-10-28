import { Logger } from "../Logger";
import { injectable } from "inversify";
import { Signale } from "signale";

@injectable()
class SignaleLogger implements Logger {
  private signale: any;

  constructor() {
    this.signale = new Signale({
      types: {
        debug: {
          badge: ".",
          color: "grey",
          label: "debug"
        }
      }
    });
    this.signale.config({
      displayTimestamp: true
    })
  }

  private transform(body: any): string {
    if (typeof body === "string") {
      return body
    } else if (typeof body === "number") {
      return body.toString()
    } else {
      return JSON.stringify(body)
    }
  }

  public debug(body: string, extra?: any) {
    this.signale.debug(this.transform(body));
    if (extra) {
      this.signale.debug(this.transform(extra));
    }
  }

  public error(body: string, extra?: any) {
    this.signale.error(this.transform(body));
    if (extra) {
      this.signale.error(this.transform(extra));
    }
  }

  public info(body: string, extra?: any) {
    this.signale.info(this.transform(body));
    if (extra) {
      this.signale.info(this.transform(extra));
    }
  }

  public trace(body: string, extra?: any) {
    this.signale.log(this.transform(body));
    if (extra) {
      this.signale.log(this.transform(extra));
    }
  }

  public warn(body: string, extra?: any) {
    this.signale.warn(this.transform(body));
    if (extra) {
      this.signale.warn(this.transform(extra));
    }
  }

  public fatal(body: string, extra?: any) {
    this.signale.fatal(this.transform(body));
    if (extra) {
      this.signale.fatal(this.transform(extra));
    }
  }
}

export { SignaleLogger };
