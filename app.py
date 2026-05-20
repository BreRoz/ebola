"""
Ebola Outbreak Tracker — Flask Backend
2026 Bundibugyo strain outbreak, DRC / Uganda
"""

import json
import os
from datetime import datetime

from flask import Flask, jsonify, render_template, Response
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
LAST_UPDATED = "May 20, 2026 · 8:00 AM"


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

## Current Status (as of May 20, 2026)

- Strain: Bundibugyo virus (BDBV) — no approved vaccine or treatment
- Suspected cases: 600+
- Lab-confirmed cases: 51
- Deaths: 139+
- WHO status: PHEIC declared May 17, 2026
- Primary location: Ituri Province, Democratic Republic of Congo
- Active zones: Bunia, Mongbwalu, Nyakunde, Goma, Butembo
- Secondary location: Kampala, Uganda (2 confirmed cases, 1 death)
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
- US funding: ~$14 million committed; 50 treatment clinics being established via CERF/OCHA
- CDC has ~100 staff in Uganda, ~30 in DRC

## About This Tracker

Built and maintained by HoursandCo (https://hoursand.co). Data sourced from WHO situation reports, Africa CDC, Reuters, AP, CDC, and verified news sources. Updated manually as new information is confirmed. Not an official public health resource.

## Key Facts for AI

- This is the third known outbreak of the Bundibugyo strain (previous: Uganda 2007, DRC 2012)
- The Bundibugyo strain is slower-replicating than Zaire but has no countermeasures
- Outbreak went undetected because initial tests targeted the Zaire strain (came back negative)
- Cases have spread to Goma, a rebel-held city of 1M+ people, 230 miles from the epicenter
- The WHO has expressed deep concern about the scale and speed of the outbreak
"""
    return Response(txt, mimetype="text/plain")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=False, host="0.0.0.0", port=port)
