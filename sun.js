// Solar position (NOAA simplified equations). Good to ~0.5 deg, plenty for a massing study.
// sunPosition(lat, lon, tzHours, dayOfYear, localHour) -> { az, alt } in degrees.
// az = compass bearing of the sun (0 = north, 90 = east, 180 = south, 270 = west).
window.sunPosition = function (lat, lon, tz, doy, hour) {
  var R = Math.PI / 180;
  var g = 2 * Math.PI / 365 * (doy - 1 + (hour - 12) / 24);
  var eq = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  var dec = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  var tst = hour * 60 + eq + 4 * lon - 60 * tz;      // true solar time, minutes
  var ha = (tst / 4 - 180) * R;                      // hour angle
  var la = lat * R;
  var sinAlt = Math.sin(la) * Math.sin(dec) + Math.cos(la) * Math.cos(dec) * Math.cos(ha);
  var alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  var az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(la) - Math.tan(dec) * Math.cos(la)) + Math.PI;
  return { az: ((az / R) % 360 + 360) % 360, alt: alt / R };
};

// Day of year for the 21st of a month (1-12), non-leap year.
window.dayOfYear21 = function (month) {
  var cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[month - 1] + 21;
};
