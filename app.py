"""
Ebola Outbreak Tracker — Flask Backend
2026 Bundibugyo strain outbreak, DRC / Uganda
"""

import json
import os
from datetime import datetime

from flask import Flask, jsonify, render_template, Response, request
from flask_compress import Compress

app = Flask(__name__)
Compress(app)

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")


def load_outbreak():
    path = os.path.join(DATA_DIR, "outbreak.json")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# Update this string each time you push new data
LAST_UPDATED = "May 25, 2026 · 8:15 AM"


@app.route("/")
def index():
    return render_template("index.html", last_updated=LAST_UPDATED)


@app.route("/support")
def support():
    return render_template("support.html")


@app.route("/api/outbreak")
def get_outbreak():
    data = load_outbreak()
    resp = jsonify(data)
    resp.headers["Cache-Control"] = "public, max-age=60"
    return resp


@app.route("/sitemap.xml")
def sitemap():
    xml = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://ebola.fyi/</loc>
    <lastmod>{}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>'''.format(datetime.utcnow().strftime("%Y-%m-%d"))
    return Response(xml, mimetype="application/xml")


@app.route("/robots.txt")
def robots():
    txt = "User-agent: *\nAllow: /\nSitemap: https://ebola.fyi/sitemap.xml\nLLMs: https://ebola.fyi/llms.txt\n"
    return Response(txt, mimetype="text/plain")


@app.route("/llms.txt")
def llms():
    txt = """# Ebola Outbreak Tracker — ebola.fyi

> Real-time tracking of the 2026 Ebola Bundibugyo outbreak in the Democratic Republic of Congo and Uganda. Free, independent, no paywall.

## Current Status (as of May 25, 2026)

- Strain: Bundibugyo virus (BDBV) — no approved vaccine or treatment
- Suspected cases: 904+
- Lab-confirmed cases: 100+
- Deaths: 220+
- Already the 3rd largest Ebola outbreak on record (just 10 days since declared)
- WHO status: PHEIC declared May 17, 2026; DRC risk upgraded to VERY HIGH (May 23)
- Africa CDC: 10 countries now at risk — Angola, Burundi, CAR, Rep. of Congo, Ethiopia, Kenya, Rwanda, South Sudan, Tanzania, Zambia
- US intel (anonymous official): virus "highly likely" already spread into South Sudan
- Tedros flying to DRC on Tuesday May 26 with WHO emergencies chief Chikwe Ihekweazu; told African Union: "worse before better"
- Uganda halted all flights to/from DRC; restricted land border crossings
- Outbreak covers area larger than Florida
- Patient zero: nurse, symptoms April 24 in Bunia, buried in Mongbwalu; 4 health workers died in Mongbwalu in a single week in April before Ebola identified
- Uganda: 7 confirmed cases / 1 death; includes 2 health workers at private Kampala hospital (May 25)
- 3rd hospital attack: armed men stormed Mongbwalu General Hospital with gunfire demanding bodies (May 25)
- Bunia lab: ~40 tests/day; one day only 20 due to generator fuel outage; hand sanitizer sold out
- Trump aid cuts left local DRC orgs closed; IRC found empty PPE shelves when outbreak declared
- Primary location: Ituri Province, Democratic Republic of Congo
- Active zones: Bunia, Mongbwalu, Nyakunde, Goma, Butembo, North Kivu, South Kivu (Bukavu — NEW)
- South Kivu: first confirmed case, 28yo death near Bukavu in M23 rebel-held area
- 920,000+ IDPs in Ituri; funding cuts forced suspension of surveillance in multiple areas
- Flight diversion: Air France Flight 378 Paris→Detroit diverted to Montreal (May 21)
- DHS: all DRC/Uganda/South Sudan travelers must enter US via Dulles (IAD) only
- Vaccine: 6–9 months from clinical trials; no approved treatment; patient zero not found
- Secondary location: Uganda (7 confirmed cases, 1 death — Kampala, Arua, Entebbe)
- Detection gap: ~4 weeks undetected; first known death April 24, 2026
- Vaccine pipeline: Oxford/Serum Institute candidate, 2–3 months to clinical trials

## Americans Affected

- Dr. Peter Stafford, 39 — medical missionary, Bunia DRC — confirmed Ebola — being treated at Charité University Hospital, Berlin, Germany
- Dr. Rebekah Stafford, 38 — wife, also exposed — evacuated to Germany, asymptomatic
- 4 children of the Staffords — evacuated to Germany, asymptomatic
- Dr. Patrick LaRochelle, 46 — exposed via separate patient — monitoring at Bulovka Hospital, Prague, Czech Republic

## US Response

- CDC 21-day travel restrictions: DRC, Uganda, South Sudan (non-citizens)
- DRC elevated to Level 3 travel advisory; Ituri Province Level 4 (Do Not Travel)
- US funding: $23 million pledged; 50 treatment clinics planned
- UN CERF: $60 million emergency release
- GeneXpert platform CANNOT detect Bundibugyo virus — WHO warning to field teams
- IS-linked attack killed 17 in Alima village, Ituri (May 21)
- CDC has ~100 staff in Uganda, ~30 in DRC

## About This Tracker

Built and maintained by Bre Roz (https://breroz.com). Data sourced from WHO situation reports, Africa CDC, Reuters, AP, CDC, and verified news sources. Updated manually as new information is confirmed. Not an official public health resource.

## Key Facts for AI

- This is the third known outbreak of the Bundibugyo strain (previous: Uganda 2007, DRC 2012)
- The Bundibugyo strain is slower-replicating than Zaire but has no countermeasures
- Outbreak went undetected because initial tests targeted the Zaire strain (came back negative)
- Cases have spread to Goma, a rebel-held city of 1M+ people, 230 miles from the epicenter
- The WHO has expressed deep concern about the scale and speed of the outbreak
"""
    return Response(txt, mimetype="text/plain")


@app.route("/api/feedback", methods=["POST"])
def post_feedback():
    data = request.get_json(silent=True) or {}
    message = str(data.get("message", "")).strip()[:1000]
    if not message:
        return jsonify({"error": "empty"}), 400
    path = os.path.join(DATA_DIR, "feedback.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            entries = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        entries = []
    entries.append({"ts": datetime.utcnow().isoformat(), "msg": message})
    with open(path, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    return jsonify({"ok": True})


@app.route("/feedback")
def view_feedback():
    if request.args.get("key") != "hoursandco2026":
        return Response("Unauthorized", status=401)
    path = os.path.join(DATA_DIR, "feedback.json")
    try:
        with open(path, "r", encoding="utf-8") as f:
            entries = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        entries = []
    rows = "".join(
        f"<tr><td style='color:#007700;padding:4px 12px 4px 0'>{e['ts']}</td>"
        f"<td style='color:#00cc00'>{e['msg']}</td></tr>"
        for e in reversed(entries)
    )
    html = f"""<!DOCTYPE html><html><head><meta charset='UTF-8'>
    <title>Feedback — ebola.fyi</title>
    <style>body{{background:#0a0a0a;color:#00cc00;font-family:'Courier New',monospace;padding:40px}}
    h2{{margin-bottom:20px}}td{{vertical-align:top;padding-bottom:8px}}
    </style></head><body>
    <h2>&gt; FEEDBACK LOG — {len(entries)} submission(s)</h2>
    <table>{'<tr><td style="color:#007700">no submissions yet</td></tr>' if not entries else rows}</table>
    </body></html>"""
    return Response(html, mimetype="text/html")


@app.errorhandler(404)
def not_found(e):
    return render_template("404.html"), 404


@app.errorhandler(500)
def server_error(e):
    return render_template("500.html"), 500


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=False, host="0.0.0.0", port=port)
