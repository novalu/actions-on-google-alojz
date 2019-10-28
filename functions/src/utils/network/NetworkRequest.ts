import { inject, injectable } from "inversify";
import * as superagent from "superagent";
import { NetworkLogger } from "./NetworkLogger";
import {TYPES} from "../../di/types";

@injectable()
class NetworkRequest {
  constructor(
    @inject(TYPES.NetworkLogger) private networkLogger: NetworkLogger
  ) {}

  public instance() {
    return (superagent.agent() as any).use(
      this.networkLogger.getSuperagentPlugin()
    );
  }

  public get(url: string): any {
    return this.instance().get(url);
  }

  public getJson(url: string): any {
    return this.instance()
      .get(url)
      .set("Accept", "application/json");
  }

  public postJson(url: string, data: object): any {
      return this.instance()
          .post(url)
          .send(data)
          .set("Accept", "application/json");
  }

  public post(url: string): any {
    return this.instance().post(url)
  }
}

export { NetworkRequest };
