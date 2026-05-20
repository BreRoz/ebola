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
    <loc>https://ebola.breroz.com/</loc>
    <lastmod>{}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>'''.format(datetime.utcnow().strftime("%Y-%m-%d"))
    return Response(xml, mimetype="application/xml")


@app.route("/robots.txt")
def robots():
    txt = "User-agent: *\nAllow: /\nSitemap: https://ebola.breroz.com/sitemap.xml\n"
    return Response(txt, mimetype="text/plain")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app.run(debug=False, host="0.0.0.0", port=port)
