from app import app
from flask import render_template, request
from instagram_web_api import Client, ClientCompatPatch, ClientError, ClientLoginError

import hashlib
import string
import random
import json
import sys
import requests

major_cities = []
GOOGLE_API_KEY = 'AIzaSyCp_HUtO07Z1y5bCAIuk-7F6zfaJ0jHFKs'

def getMajorCities():
  global major_cities
  with open("majorcities.txt") as f:
    major_cities = f.readlines()
  major_cities = [x.strip().replace(" ","").replace("-","").replace("'","").lower() for x in major_cities]


class MyClient(Client):
  @staticmethod
  def _extract_rhx_gis(html):
      options = string.ascii_lowercase + string.digits
      text = ''.join([random.choice(options) for _ in range(8)])
      return hashlib.md5(text.encode()).hexdigest()

web_api = MyClient(auto_patch=True, drop_incompat_keys=False)

def query_images(location_tag):
  tag_feed = web_api.tag_feed(location_tag, count=10)
  imgs = []
  for post in tag_feed['data']['hashtag']['edge_hashtag_to_top_posts']['edges']:
    imgs.append(post['node']['display_url'])
  return imgs


@app.route('/')
@app.route('/index')
@app.route('/index/<city>', methods = ["GET", "POST"])
def index(city=""):
    if city == "":
        return render_template("thingy.html")
    else: 
        print("data " + city)
        imgs = query_images(city)
        return json.dumps(imgs)

# used to check if city is a major city
# checks city and region since either may be city name
@app.route('/majorcity/<names>', methods = ["GET","POST"])
def majorcity(names):
  # first one is city, second is region (if exists)
  parsed = names.split(",")
  city = parsed[0]
  region = parsed[1]
  global major_cities
  if not city == "" and city in major_cities:
    return city
  elif not region == "" and region in major_cities:
    return region
  else:
    return "NotMajor"

# example:
# /nearbyplaces?location=40.803199,-73.945298&radius=1500&type=restaurant
@app.route('/nearbyplaces')
def nearby():
  base = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
  location = request.args.get('location')
  radius = request.args.get('radius')
  querytype = request.args.get('type')
  url = base + \
        'location=' + location + \
        '&radius=' + radius + \
        '&type=' + querytype + \
        '&key=' + GOOGLE_API_KEY
  return requests.get(url).json()


@app.route('/test')
def test():
  return render_template('test.html')