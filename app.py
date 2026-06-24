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
LAST_UPDATED = "June 25, 2026 · 9:00 AM CDT"


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

## Current Status (as of May 27, 2026)

- Strain: Bundibugyo virus (BDBV) — no approved vaccine or treatment
- Suspected cases: 1,077 (CDC, May 29)
- Lab-confirmed cases: 121
- Deaths: 246 suspected / 17 confirmed
- FIRST PATIENT RECOVERED — discharged May 28 after 2 negative tests
- FUNDING HALVED: pledges fell sharply since start of week (Africa CDC); $500M previously announced
- 5 schoolchildren killed; DRC refuses to close schools
- CFR: 22.8% among suspected / 14% among confirmed; 4 HCW deaths confirmed; 13 health zones
- Kenya High Court BLOCKED US Ebola quarantine facility plan (Katiba Institute petition)
- Africa CDC: vaccine expected by end of 2026
- Rwanda and Uganda both closed borders with DRC
- $500 million pledged by international donors (Africa CDC)
- Canada 90-day ban was NOT based on public health advice — driven by FIFA World Cup hosting
- WHO advises against travel restrictions; Africa CDC: "shame" South Sudan (zero cases) under ban
- WHO treatment candidates: Mapp antibody, Regeneron, remdesivir, obeldesivir; Oxford/Serum vaccine 2-3 months to trial
- Already the 3rd largest Ebola outbreak on record (just 10 days since declared)
- WHO status: PHEIC declared May 17, 2026; DRC risk upgraded to VERY HIGH (May 23)
- Uganda: border with DRC CLOSED "with immediate effect" (May 27) — against WHO guidance
- Canada: 90-day entry ban (DRC/Uganda/South Sudan); Bahamas: quarantine/isolation rules
- Africa CDC: 10 countries now at risk — Angola, Burundi, CAR, Rep. of Congo, Ethiopia, Kenya, Rwanda, South Sudan, Tanzania, Zambia
- US intel (anonymous official): virus "highly likely" already spread into South Sudan
- Only 7% of 3,600 known contacts traced; WHO internal doc: "Every day without a fully resourced response is a day the outbreak gains ground"
- Tedros arrived DRC; called for ceasefire: "catastrophic collision of disease and conflict"
- Experimental US antibody treatment may be introduced soon; ECDC/EU Health Task Force deploying
- Outbreak covers area larger than Florida; Bunia lab: ~40 tests/day; sanitizer sold out
- Trump aid cuts left local DRC orgs closed; IRC found empty PPE shelves at outbreak declaration
- Primary location: Ituri Province, Democratic Republic of Congo
- Active zones: Bunia, Mongbwalu, Nyakunde, Goma, Butembo, North Kivu, South Kivu (Bukavu — NEW)
- South Kivu: first confirmed case, 28yo death near Bukavu in M23 rebel-held area
- 920,000+ IDPs in Ituri; funding cuts forced suspension of surveillance in multiple areas
- Flight diversion: Air France Flight 378 Paris→Detroit diverted to Montreal (May 21)
- DHS: all DRC/Uganda/South Sudan travelers must enter US via Dulles (IAD) only
- Vaccine: 6–9 months from clinical trials; no approved treatment; patient zero not found
- Secondary location: Uganda (9 confirmed cases, 1 death — Kampala, Arua, Entebbe; border with DRC closed)
- Brazil (São Paulo): 1 suspected case, man returned from DRC, in isolation — not confirmed
- 5 total recoveries confirmed; new treatment center opened in Bunia
- Bunia lab now returns results in 24 hours (previously sent to Kinshasa)
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
