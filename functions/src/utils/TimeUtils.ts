import moment from "moment";
import momentTimezone from "moment-timezone";

class TimeUtils {
  public static readonly PATTERN_TIME_HUMAN = "HH:mm";
  public static readonly PATTERN_DATE_TIME_HUMAN = "D.M.YYYY HH:mm";
  public static readonly PATTERN_DATE_HUMAN = "D.M.YYYY";
  public static readonly PATTERN_DATE_TIME_HUMAN_SHORT = "D.M. HH:mm";
  public static readonly PATTERN_DATE_TIME_API = "YYYY-MM-DD HH:mm:ss";
  public static readonly PATTERN_DATE_TIME_DB = "YYYY-MM-DDTHH:mm:ssZ";

  public static readonly TIMEZONE_PRAGUE = "Europe/Prague";

  public static momentTz: momentTimezone.Moment = momentTimezone;

  public static init() {
    moment.locale("cs");
    momentTimezone.tz.setDefault(TimeUtils.TIMEZONE_PRAGUE);
  }
}

export { TimeUtils };
