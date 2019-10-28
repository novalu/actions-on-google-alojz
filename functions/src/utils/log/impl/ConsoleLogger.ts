/* tslint:disable:no-console */
import {Logger} from "../Logger";
import {injectable} from "inversify";

@injectable()
class ConsoleLogger implements Logger {

    public debug(body: any, extra?: any) {
        console.log(body);
        if (extra) {
            console.log(extra);
        }
    }

    public error(body: any, extra?: any) {
        console.error(body);
        if (extra) {
            console.error(extra);
        }
    }

    public fatal(body: any, extra?: any) {
        console.error(body);
        if (extra) {
            console.error(extra);
        }
    }

    public info(body: any, extra?: any) {
        console.log(body);
        if (extra) {
            console.log(extra);
        }
    }

    public trace(body: any, extra?: any) {
        console.log(body);
        if (extra) {
            console.log(extra);
        }
    }

    public warn(body: any, extra?: any) {
        console.error(body);
        if (extra) {
            console.error(extra);
        }
    }

}

export { ConsoleLogger }
