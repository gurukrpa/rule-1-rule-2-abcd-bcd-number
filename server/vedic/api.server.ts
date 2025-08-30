import cors from "cors";
import express from "express";
import { DateTime } from "luxon";
import path from "path";
import swe from "sweph";

const FIXED_LAHIRI_DEG = 24.214722; // 24°12′53″
const SIG = ["ar","ta","ge","cn","le","vi","li","sc","sg","cp","aq","pi"] as const;

const norm360 = (x:number)=>{ x%=360; return x<0?x+360:x; };
const siderealFromTropicalFixed = (t:number)=> norm360(t - FIXED_LAHIRI_DEG);
const signIndex = (lon:number)=> Math.floor(norm360(lon)/30);
const houseFromAsc = (a:number,b:number)=> ((b - a + 12) % 12) + 1;
const token = (ascIdx:number, objIdx:number, ascSign:string, key:string)=> `as-${houseFromAsc(ascIdx,objIdx)}-${ascSign}-${key}`;

function dmsInSign(lon:number){
  const idx = signIndex(lon);
  const within = norm360(lon) - idx*30;
  const d = Math.floor(within);
  const mFloat = (within - d)*60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m)*60);
  return { idx, sign: SIG[idx], d, m, s };
}

// ---- Swiss init (no sidereal mode; we subtract fixed ayanamsha ourselves) ----
swe.set_ephe_path(path.join(process.cwd(), "ephe"));

// ---- Time helpers: local ISO -> JD(UT) ----
function jdutFromLocalISO(isoLocal:string, tz:string){
  const dt = DateTime.fromISO(isoLocal, { zone: tz });
  if(!dt.isValid) throw new Error("Invalid dateTime or tz");
  const ut = dt.toUTC();
  const hour = ut.hour + ut.minute/60 + ut.second/3600 + ut.millisecond/3600000;
  return swe.julday(ut.year, ut.month, ut.day, hour, swe.constants.SE_GREG_CAL);
}

function jdutToLocal(jdut:number, tz:string){
  // Convert JD(UT) -> ISO in given IANA tz via Luxon
  const { year, month, day, hour } = swe.revjul(jdut, swe.constants.SE_GREG_CAL);
  const secs = (hour*3600);
  const utc = DateTime.utc(year, month, day).plus({ seconds: Math.round(secs) });
  return utc.setZone(tz);
}

// ---- Sunrise (Swiss rise/transit) ----
function sunriseJdutForLocalDate(localDateISO:string, tz:string, lat:number, lon:number){
  const noonLocal = DateTime.fromISO(localDateISO+"T12:00:00", { zone: tz });
  const noonUT = noonLocal.toUTC();
  const jd0 = swe.julday(noonUT.year, noonUT.month, noonUT.day, noonUT.hour + noonUT.minute/60 + noonUT.second/3600, swe.constants.SE_GREG_CAL);

  const rsmi = swe.constants.SE_CALC_RISE;
  const geopos: [number, number, number] = [lon, lat, 0];
  const press = 1013.25, temp = 15.0;
  const result = swe.rise_trans(jd0, swe.constants.SE_SUN, "", swe.constants.SEFLG_SWIEPH, rsmi, geopos, press, temp);
  const tret = result.data;
  
  const local = jdutToLocal(tret, tz);
  if(local.toISODate() !== noonLocal.toISODate()){
    const shift = local < noonLocal ? -1 : 1;
    const newNoonLocal = noonLocal.plus({ days: shift });
    const newNoonUT = newNoonLocal.toUTC();
    const jd1 = swe.julday(newNoonUT.year, newNoonUT.month, newNoonUT.day, newNoonUT.hour + newNoonUT.minute/60 + newNoonUT.second/3600, swe.constants.SE_GREG_CAL);
    const result2 = swe.rise_trans(jd1, swe.constants.SE_SUN, "", swe.constants.SEFLG_SWIEPH, rsmi, geopos, press, temp);
    return result2.data;
  }
  return tret;
}

// ---- Sunset helper for Gulika/Mandi ----
function sunsetJdutForLocalDate(localDateISO: string, tz: string, lat: number, lon: number){
  const noonLocal = DateTime.fromISO(localDateISO+"T12:00:00", { zone: tz }).toUTC();
  const jd0 = swe.julday(noonLocal.year, noonLocal.month, noonLocal.day,
                         noonLocal.hour + noonLocal.minute/60 + noonLocal.second/3600, swe.constants.SE_GREG_CAL);
  const rsmi = swe.constants.SE_CALC_SET;
  const geopos: [number, number, number] = [lon, lat, 0];
  const result = swe.rise_trans(jd0, swe.constants.SE_SUN, "", swe.constants.SEFLG_SWIEPH, rsmi, geopos, 1013.25, 15.0);
  const tret = result.data;
  
  const want = DateTime.fromISO(localDateISO, {zone: tz});
  const got = jdutToLocal(tret, tz);
  if(got.toISODate() !== want.toISODate()){
    const shift = got < want ? -1 : 1;
    const noon2 = want.plus({days: shift}).set({hour:12}).toUTC();
    const jd1 = swe.julday(noon2.year, noon2.month, noon2.day, noon2.hour, swe.constants.SE_GREG_CAL);
    const result2 = swe.rise_trans(jd1, swe.constants.SE_SUN, "", swe.constants.SEFLG_SWIEPH, rsmi, geopos, 1013.25, 15.0);
    return result2.data;
  }
  return tret;
}

// ---- Asc/Moon sidereal (fixed) ----
function ascSiderealFixed(jdut:number, lat:number, lon:number){
  const h = swe.houses_ex(jdut, swe.constants.SEFLG_SWIEPH, lat, lon, "P");
  return siderealFromTropicalFixed(h.data.points[0]); // Ascendant is first point
}

function moonSiderealFixed(jdut:number){
  const result = swe.calc_ut(jdut, swe.constants.SE_MOON, swe.constants.SEFLG_SWIEPH);
  const moonTrop = result.data[0]; // Longitude is first element
  return siderealFromTropicalFixed(moonTrop);
}

function sunSiderealFromJdut(jdut:number){
  const result = swe.calc_ut(jdut, swe.constants.SE_SUN, swe.constants.SEFLG_SWIEPH);
  const sunTrop = result.data[0]; // Longitude is first element
  return siderealFromTropicalFixed(sunTrop);
}

// ---- Specials (fixed ayanamsha only) ----
function calcHL(sunSidAtRiseDeg:number, minutesSinceRise:number){
  return norm360(sunSidAtRiseDeg + minutesSinceRise/2); // 0.5° per minute
}
function calcGL(sunSidAtRiseDeg:number, minutesSinceRise:number){
  return norm360(sunSidAtRiseDeg + minutesSinceRise*1.25); // 1.25° per minute
}
function calcPP(sunSidAtRiseDeg:number, minutesSinceRise:number){
  let pp = norm360(sunSidAtRiseDeg + minutesSinceRise*5); // minutes * 5°
  const sunIdx = signIndex(sunSidAtRiseDeg);
  const mod = ["mov","fix","dual","mov","fix","dual","mov","fix","dual","mov","fix","dual"][sunIdx];
  if(mod==="fix") pp = norm360(pp + 240);
  else if(mod==="dual") pp = norm360(pp + 120);
  return pp;
}
function calcSL(lagnaSidDeg:number, moonSidDeg:number){
  const NAK = 360/27;
  const start = Math.floor((moonSidDeg%360)/NAK)*NAK;
  const frac = ((moonSidDeg - start + 360)%360) / NAK;
  return norm360(lagnaSidDeg + frac*360);
}
const LORD = ["ma","ve","me","mo","su","me","ve","ma","ju","sa","sa","ju"] as const;
const KALA: Record<string, number> = { su:30, mo:16, ma:6, me:8, ju:10, ve:12, sa:1 };
function calcIL(lagnaSidDeg:number, moonSidDeg:number){
  const ninth = (i:number)=> (i+8)%12;
  const lagIdx = signIndex(lagnaSidDeg), mooIdx = signIndex(moonSidDeg);
  let r = (KALA[LORD[ninth(lagIdx)]] + KALA[LORD[ninth(mooIdx)]]) % 12;
  if(r===0) r = 12;
  return (mooIdx + r - 1) % 12; // sign index (sign-only)
}
function calcVAR(lagnaDeg:number, hlDeg:number){
  const isEven = (i:number)=> [1,3,5,7,9,11].includes(i);
  const L = signIndex(lagnaDeg), H = signIndex(hlDeg);
  const adj = (d:number)=> isEven(signIndex(d)) ? norm360(360 - d) : norm360(d);
  const La = adj(lagnaDeg), Ha = adj(hlDeg);
  const same = (isEven(L) === isEven(H));
  let val = same ? norm360(La + Ha) : Math.abs(La - Ha);
  if (isEven(L)) val = norm360(360 - val);
  return signIndex(val); // sign-only
}

// ---- Gulika & Mandi (Upagrahas) ----
const WK = ["su","mo","ma","me","ju","ve","sa"] as const;
const wkIndex = (w: typeof WK[number]) => WK.indexOf(w);

function weekdayLord(dtISO: string, tz: string): typeof WK[number] {
  const d = DateTime.fromISO(dtISO, { zone: tz });
  const dow = d.weekday; // 1=Mon .. 7=Sun
  return (["mo","ma","me","ju","ve","sa","su"] as const)[dow-1];
}

function kalavelaForEventHalf(eventISO: string, tz: string, lat: number, lon: number){
  const ev = DateTime.fromISO(eventISO, {zone: tz});
  const civil = ev.toISODate()!;
  const sr = sunriseJdutForLocalDate(civil, tz, lat, lon);
  const ss = sunsetJdutForLocalDate(civil, tz, lat, lon);
  const srL = jdutToLocal(sr, tz);
  const ssL = jdutToLocal(ss, tz);

  let startLocal: DateTime, endLocal: DateTime, half: "day"|"night";
  if(ev >= srL && ev < ssL){
    startLocal = srL; endLocal = ssL; half = "day";
  }else{
    const nightStart = ev >= ssL ? ssL : jdutToLocal(
      sunsetJdutForLocalDate(ev.minus({days:1}).toISODate()!, tz, lat, lon), tz
    );
    const nightEnd = jdutToLocal(
      sunriseJdutForLocalDate(ev >= ssL ? ev.toISODate()! : civil, tz, lat, lon), tz
    );
    startLocal = nightStart; endLocal = nightEnd; half = "night";
  }
  const totalMin = endLocal.diff(startLocal, "minutes").minutes;
  const segMin = totalMin / 8;
  return { startLocal, segMin, half, srLocal: srL, ssLocal: ssL };
}

function saturnSegmentIndex(dayLord: typeof WK[number], half: "day"|"night"){
  const startLord = half==="day" ? dayLord : WK[(wkIndex(dayLord)+4)%7]; // 5th from day-lord
  for(let i=0;i<7;i++){
    if (WK[(wkIndex(startLord)+i)%7]==="sa") return i;
  }
  return 6; // fallback
}

function ascSidAtLocal(dt: DateTime, lat: number, lon: number){
  const ut = dt.toUTC();
  const jd = swe.julday(ut.year, ut.month, ut.day, ut.hour + ut.minute/60 + ut.second/3600, swe.constants.SE_GREG_CAL);
  const h = swe.houses_ex(jd, swe.constants.SEFLG_SWIEPH, lat, lon, "P");
  return siderealFromTropicalFixed(h.data.points[0]); // Ascendant is first point
}

// ---- Planets & longitudes (sidereal fixed) ----
const PLANETS = ["su","mo","ma","me","ju","ve","sa","ra","ke"] as const;
function planetSiderealFixed(jdut:number, which: typeof PLANETS[number]){
  if(which==="ke"){
    const rahu = planetSiderealFixed(jdut, "ra");
    return norm360(rahu + 180);
  }
  if(which==="ra"){
    const result = swe.calc_ut(jdut, swe.constants.SE_TRUE_NODE, swe.constants.SEFLG_SWIEPH);
    const longitude = result.data[0];
    return siderealFromTropicalFixed(longitude);
  }
  const map: Record<string, number> = {
    su: swe.constants.SE_SUN, mo: swe.constants.SE_MOON, ma: swe.constants.SE_MARS, me: swe.constants.SE_MERCURY,
    ju: swe.constants.SE_JUPITER, ve: swe.constants.SE_VENUS, sa: swe.constants.SE_SATURN
  };
  const result = swe.calc_ut(jdut, map[which], swe.constants.SEFLG_SWIEPH);
  const longitude = result.data[0];
  return siderealFromTropicalFixed(longitude);
}

function allBodiesSidereal(jdut:number, lat:number, lon:number){
  const asc = ascSiderealFixed(jdut, lat, lon);
  const out: Record<string, number> = { as: asc };
  for(const p of PLANETS) out[p] = planetSiderealFixed(jdut, p);
  return out;
}

// ---- Varga helpers ----
const isMov = (i:number)=> [0,3,6,9].includes(i);       // Ar,Cn,Li,Cap
const isFix = (i:number)=> [1,4,7,10].includes(i);      // Ta,Le,Sc,Aq
const isDual= (i:number)=> [2,5,8,11].includes(i);      // Ge,Vi,Sg,Pi

function fracInSign(lon:number){ return (norm360(lon)%30)/30; }

function d3_parashara(lon:number){
  const s = signIndex(lon), part = Math.floor(fracInSign(lon)*3); // 0,1,2
  if (s%2===0) return (s + 4*part) % 12;        // odd signs (Ar idx=0): +0,+4,+8
  else         return (s + (12 - 4*part)%12) % 12; // even signs reverse: +0,-4,-8
}

function d9_navamsa(lon:number){
  const s = signIndex(lon), p = Math.floor(fracInSign(lon)*9); // 0..8
  let start = s;
  if (isFix(s)) start = (s + 8) % 12;   // 9th from sign
  if (isDual(s)) start = (s + 4) % 12;  // 5th from sign
  return (start + p) % 12;
}

function d10_dasamsa(lon:number){
  const s = signIndex(lon), p = Math.floor(fracInSign(lon)*10);
  return ((s%2===0) /*Ar=0 odd*/ ? (s + p) : ((s + 8) % 12 + p) % 12);
}

function d12_dwadasamsa(lon:number){
  const s = signIndex(lon), p = Math.floor(fracInSign(lon)*12);
  return (s + p) % 12; // from sign itself
}

function d30_trimsamsa(lon:number){
  const s = signIndex(lon);
  const deg = (norm360(lon)%30);
  let lord: "ma"|"sa"|"ju"|"me"|"ve";
  if (s%2===0){ // odd sign indices (Ar=0) => odd signs
    if (deg < 5) lord="ma";
    else if (deg <10) lord="sa";
    else if (deg <18) lord="ju";
    else if (deg <25) lord="me";
    else lord="ve";
    const oddSign: Record<typeof lord, number> = { ma:0, me:2, ju:8, ve:1, sa:10 }; // Ar,Ge,Sg,Ta,Aq
    return oddSign[lord];
  }else{
    if (deg < 5) lord="ve";
    else if (deg <12) lord="me";
    else if (deg <20) lord="ju";
    else if (deg <25) lord="sa";
    else lord="ma";
    const evenSign: Record<typeof lord, number> = { ma:7, me:5, ju:11, ve:6, sa:9 }; // Sc,Vi,Pi,Li,Cap
    return evenSign[lord];
  }
}

function dEqual(lon:number, n:number){
  const s = signIndex(lon);
  const p = Math.floor(fracInSign(lon)*n);
  return (s + p) % 12; // start from sign itself
}

type VargaKey = "D1"|"D2"|"D3"|"D4"|"D5"|"D6"|"D7"|"D8"|"D9"|"D10"|"D11"|"D12"|"D16"|"D20"|"D24"|"D27"|"D30"|"D40"|"D45"|"D60"|"D81"|"D108"|"D144";

function vargaIndex(lon:number, which: VargaKey){
  switch(which){
    case "D1":  return signIndex(lon);
    case "D3":  return d3_parashara(lon);
    case "D9":  return d9_navamsa(lon);
    case "D10": return d10_dasamsa(lon);
    case "D12": return d12_dwadasamsa(lon);
    case "D30": return d30_trimsamsa(lon);
    case "D60": return dEqual(lon,60);
    case "D81": return dEqual(lon,81);
    case "D108":return dEqual(lon,108);
    case "D144":return dEqual(lon,144);
    case "D2": return dEqual(lon,2);
    case "D4": return dEqual(lon,4);
    case "D5": return dEqual(lon,5);
    case "D6": return dEqual(lon,6);
    case "D7": return dEqual(lon,7);
    case "D8": return dEqual(lon,8);
    case "D11":return dEqual(lon,11);
    case "D16":return dEqual(lon,16);
    case "D20":return dEqual(lon,20);
    case "D24":return dEqual(lon,24);
    case "D27":return dEqual(lon,27);
    case "D40":return dEqual(lon,40);
    case "D45":return dEqual(lon,45);
    default: return signIndex(lon);
  }
}

// ----------------------------------------------------------------------------
// Express API
// ----------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/compute", (req,res)=>{
  try{
    const { dateTime, tz, lat, lon } = req.body as { dateTime:string, tz:string, lat:number, lon:number };

    // 1) Event jdut
    const jd_ut_event = jdutFromLocalISO(dateTime, tz);

    // 2) Sunrise for SAME local date; if event before sunrise, use previous day's sunrise
    const localEvent = jdutToLocal(jd_ut_event, tz);
    const riseJdutSame = sunriseJdutForLocalDate(localEvent.toISODate()!, tz, lat, lon);
    const riseLocal = jdutToLocal(riseJdutSame, tz);
    let riseJdut = riseJdutSame;
    if (localEvent < riseLocal){
      const prevDateISO = localEvent.minus({ days:1 }).toISODate()!;
      riseJdut = sunriseJdutForLocalDate(prevDateISO, tz, lat, lon);
    }
    const riseLocalFinal = jdutToLocal(riseJdut, tz);

    // 3) Minutes since sunrise (local)
    const minutesSinceRise = (localEvent.diff(riseLocalFinal, "minutes").minutes + 24*60) % (24*60);

    // 4) Asc & Moon (sidereal fixed)
    const ascSid = ascSiderealFixed(jd_ut_event, lat, lon);
    const moonSid = moonSiderealFixed(jd_ut_event);
    const ascIdx = signIndex(ascSid), ascSign = SIG[ascIdx];

    // 5) Sun sidereal @ sunrise
    const sunAtRiseSid = sunSiderealFromJdut(riseJdut);

    // 6) Specials
    const HL = calcHL(sunAtRiseSid, minutesSinceRise);
    const GL = calcGL(sunAtRiseSid, minutesSinceRise);
    const PP = calcPP(sunAtRiseSid, minutesSinceRise);
    const SL = calcSL(ascSid, moonSid);
    const IL_idx = calcIL(ascSid, moonSid);
    const VAR_idx = calcVAR(ascSid, HL);

    // 7) Gulika & Mandi (Upagrahas)
    const dayLord = weekdayLord(localEvent.toISO()!, tz);
    const kv = kalavelaForEventHalf(localEvent.toISO()!, tz, lat, lon);
    const segIdx = saturnSegmentIndex(dayLord, kv.half);
    const gulikaStart = kv.startLocal.plus({ minutes: segIdx * kv.segMin });
    const mandiMid   = kv.startLocal.plus({ minutes: (segIdx + 0.5) * kv.segMin });

    const gulikaLon = ascSidAtLocal(gulikaStart, lat, lon);
    const mandiLon  = ascSidAtLocal(mandiMid,   lat, lon);
    const gulikaIdx = signIndex(gulikaLon), mandiIdx = signIndex(mandiLon);

    // 8) Tokens
    const tHL = token(ascIdx, signIndex(HL), ascSign, "hl");
    const tGL = token(ascIdx, signIndex(GL), ascSign, "gl");
    const tPP = token(ascIdx, signIndex(PP), ascSign, "pp");
    const tSL = token(ascIdx, signIndex(SL), ascSign, "sl");
    const tIL = token(ascIdx, IL_idx,       ascSign, "in");
    const tVAR= token(ascIdx, VAR_idx,      ascSign, "var");
    const tGULIKA = token(ascIdx, gulikaIdx, ascSign, "gu");
    const tMANDI  = token(ascIdx, mandiIdx,  ascSign, "ma");

    res.json({
      ayanamsa_fixed_deg: FIXED_LAHIRI_DEG,
      event_local: localEvent.toISO(),
      sunrise_local: riseLocalFinal.toISO(),
      minutes_since_sunrise: Math.round(minutesSinceRise),
      asc: { deg: ascSid, ...dmsInSign(ascSid) },
      moon:{ deg: moonSid, ...dmsInSign(moonSid) },
      sun_at_sunrise_sid: { deg: sunAtRiseSid, ...dmsInSign(sunAtRiseSid) },
      specials: {
        hl: { deg: HL,  ...dmsInSign(HL),  token: tHL },
        gl: { deg: GL,  ...dmsInSign(GL),  token: tGL },
        pp: { deg: PP,  ...dmsInSign(PP),  token: tPP },
        sl: { deg: SL,  ...dmsInSign(SL),  token: tSL },
        il: { idx: IL_idx,  sign: SIG[IL_idx], token: tIL },
        var:{ idx: VAR_idx, sign: SIG[VAR_idx], token: tVAR },
      },
      upagrahas: {
        gulika: { deg: gulikaLon, ...dmsInSign(gulikaLon), token: tGULIKA,
                  half: kv.half, start_local: gulikaStart.toISO() },
        mandi:  { deg: mandiLon,  ...dmsInSign(mandiLon),  token: tMANDI,
                  half: kv.half, mid_local: mandiMid.toISO() }
      }
    });
  }catch(e:any){
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

app.post("/api/varga", (req,res)=>{
  try{
    const { dateTime, tz, lat, lon, charts } = req.body as {
      dateTime: string, tz: string, lat: number, lon: number, charts: VargaKey[]
    };
    const jd = jdutFromLocalISO(dateTime, tz);

    const bodies = allBodiesSidereal(jd, lat, lon);
    const ascIdx = signIndex(bodies.as), ascSign = SIG[ascIdx];

    const out: Record<string, any> = {};
    for(const ch of charts){
      const place: Record<string, any> = {};
      for(const k of Object.keys(bodies)){
        const idx = vargaIndex(bodies[k], ch as VargaKey);
        place[k] = { idx, sign: SIG[idx] };
        if(k!=="as"){
          place[k].token = token(ascIdx, idx, ascSign, k);
        }
      }
      out[ch] = place;
    }
    res.json({
      ayanamsa_fixed_deg: FIXED_LAHIRI_DEG,
      dateTime, tz, lat, lon,
      vargas: out
    });
  }catch(e:any){
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

const PORT = process.env.PORT || 8086;
app.listen(PORT, ()=> console.log(`Vedic API (Swiss, fixed Lahiri) running on :${PORT}`));
