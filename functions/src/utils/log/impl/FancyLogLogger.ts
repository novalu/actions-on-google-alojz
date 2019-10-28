import { Logger } from "../Logger";
import { injectable } from "inversify";

import * as log from "fancy-log";

@injectable()
class FancyLogLogger implements Logger {
  private transform(body: any): string {
    if (typeof body === "string") {
      return body
    } else if (typeof body === "number") {
      return body.toString()
    } else {
      return JSON.stringify(body)
    }
  }

  public trace(body: any, extra?: any) {
    log(this.transform(body));
    if (extra) {
      log(this.transform(extra));
    }
  }

  public debug(body: any, extra?: any) {
    log(this.transform(body));
    if (extra) {
      log(this.transform(extra));
    }
  }

  public info(body: any, extra?: any) {
    log(this.transform(body));
    if (extra) {
      log(this.transform(extra));
    }
  }

  public warn(body: any, extra?: any) {
    log(this.transform(body));
    if (extra) {
      log(this.transform(extra));
    }
  }

  public error(body: any, extra?: any) {
    log.error(this.transform(body));
    if (extra) {
      log.error(this.transform(extra));
    }
  }

  public fatal(body: any, extra?: any) {
    log.error(this.transform(body));
    if (extra) {
      log.error(this.transform(extra));
    }
  }
}

export { FancyLogLogger };
