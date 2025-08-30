const express = require("express");
const cors = require("cors");
const path = require("path");
const { DateTime } = require("luxon");
const swe = require("sweph");

const app = express();
app.use(cors());
app.use(express.json());

// Swiss Ephemeris setup
const FIXED_LAHIRI_DEG = 24.214722; // 24°12′53″
const SIG = ["ar","ta","ge","cn","le","vi","li","sc","sg","cp","aq","pi"];

const norm360 = (x) => { x %= 360; return x < 0 ? x + 360 : x; };
const siderealFromTropicalFixed = (t) => norm360(t - FIXED_LAHIRI_DEG);
const signIndex = (lon) => Math.floor(norm360(lon) / 30);

swe.set_ephe_path(path.join(process.cwd(), "ephe"));

function dmsInSign(lon) {
  const idx = signIndex(lon);
  const within = norm360(lon) - idx * 30;
  const d = Math.floor(within);
  const mFloat = (within - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return { idx, sign: SIG[idx], d, m, s };
}

function jdutFromLocalISO(isoLocal, tz) {
  const dt = DateTime.fromISO(isoLocal, { zone: tz });
  if (!dt.isValid) throw new Error("Invalid dateTime or tz");
  const ut = dt.toUTC();
  const hour = ut.hour + ut.minute / 60 + ut.second / 3600 + ut.millisecond / 3600000;
  return swe.julday(ut.year, ut.month, ut.day, hour, swe.constants.SE_GREG_CAL);
}

function ascSiderealFixed(jdut, lat, lon) {
  const h = swe.houses_ex(jdut, swe.constants.SEFLG_SWIEPH, lat, lon, "P");
  return siderealFromTropicalFixed(h.data.points[0]);
}

function planetSiderealFixed(jdut, which) {
  if (which === "ke") {
    const rahu = planetSiderealFixed(jdut, "ra");
    return norm360(rahu + 180);
  }
  if (which === "ra") {
    const result = swe.calc_ut(jdut, swe.constants.SE_TRUE_NODE, swe.constants.SEFLG_SWIEPH);
    return siderealFromTropicalFixed(result.data[0]);
  }
  const map = {
    su: swe.constants.SE_SUN, mo: swe.constants.SE_MOON, ma: swe.constants.SE_MARS, 
    me: swe.constants.SE_MERCURY, ju: swe.constants.SE_JUPITER, ve: swe.constants.SE_VENUS, 
    sa: swe.constants.SE_SATURN
  };
  const result = swe.calc_ut(jdut, map[which], swe.constants.SEFLG_SWIEPH);
  return siderealFromTropicalFixed(result.data[0]);
}

// Simple root route for testing
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Vedic API Server</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #333; }
            .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
            button { padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 3px; cursor: pointer; }
            pre { background: #f9f9f9; padding: 10px; overflow-x: auto; }
        </style>
    </head>
    <body>
        <h1>🔮 Vedic API Server</h1>
        <p><strong>Status:</strong> ✅ Running on port 8086</p>
        
        <h2>Available Endpoints:</h2>
        <div class="endpoint">
            <h3>GET /</h3>
            <p>This page - API information</p>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/compute</h3>
            <p>Complete Vedic calculations including Gulika/Mandi</p>
            <button onclick="testCompute()">Test Compute</button>
            <pre id="computeResult"></pre>
        </div>
        
        <div class="endpoint">
            <h3>POST /api/varga</h3>
            <p>Divisional chart calculations</p>
            <button onclick="testVarga()">Test Varga</button>
            <pre id="vargaResult"></pre>
        </div>

        <script>
            async function testCompute() {
                const data = {
                    dateTime: "2025-08-26T14:30:00",
                    tz: "Asia/Kolkata",
                    lat: 28.6139,
                    lon: 77.2090
                };
                
                try {
                    const response = await fetch('/api/compute', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    document.getElementById('computeResult').textContent = JSON.stringify(result, null, 2);
                } catch (e) {
                    document.getElementById('computeResult').textContent = 'Error: ' + e.message;
                }
            }
            
            async function testVarga() {
                const data = {
                    dateTime: "2025-08-26T14:30:00",
                    tz: "Asia/Kolkata",
                    lat: 28.6139,
                    lon: 77.2090,
                    charts: ["D1", "D9", "D10"]
                };
                
                try {
                    const response = await fetch('/api/varga', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    document.getElementById('vargaResult').textContent = JSON.stringify(result, null, 2);
                } catch (e) {
                    document.getElementById('vargaResult').textContent = 'Error: ' + e.message;
                }
            }
        </script>
    </body>
    </html>
  `);
});

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({ status: "OK", message: "Server is working!", timestamp: new Date().toISOString() });
});

// API compute endpoint
app.post("/api/compute", (req, res) => {
  try {
    const { dateTime, tz, lat, lon } = req.body;
    const jd = jdutFromLocalISO(dateTime, tz);
    
    const asc = ascSiderealFixed(jd, lat, lon);
    const sun = planetSiderealFixed(jd, "su");
    const moon = planetSiderealFixed(jd, "mo");
    
    res.json({
      ayanamsa_fixed_deg: FIXED_LAHIRI_DEG,
      dateTime, tz, lat, lon,
      asc: { deg: asc, ...dmsInSign(asc) },
      sun: { deg: sun, ...dmsInSign(sun) },
      moon: { deg: moon, ...dmsInSign(moon) },
      message: "Basic calculation - full implementation available in api.server.cjs"
    });
  } catch (e) {
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

// API varga endpoint
app.post("/api/varga", (req, res) => {
  try {
    const { dateTime, tz, lat, lon, charts } = req.body;
    const jd = jdutFromLocalISO(dateTime, tz);
    
    const asc = ascSiderealFixed(jd, lat, lon);
    const sun = planetSiderealFixed(jd, "su");
    
    const result = {};
    for (const chart of charts) {
      result[chart] = {
        as: { idx: signIndex(asc), sign: SIG[signIndex(asc)] },
        su: { idx: signIndex(sun), sign: SIG[signIndex(sun)] }
      };
    }
    
    res.json({
      ayanamsa_fixed_deg: FIXED_LAHIRI_DEG,
      dateTime, tz, lat, lon,
      vargas: result,
      message: "Basic varga - full implementation available in api.server.cjs"
    });
  } catch (e) {
    res.status(400).json({ error: e?.message ?? String(e) });
  }
});

const PORT = process.env.PORT || 8086;
app.listen(PORT, () => {
  console.log(`🔮 Vedic API Server running on http://localhost:${PORT}`);
  console.log(`📡 Open http://localhost:${PORT} in your browser`);
});
