from app import app
from flask import render_template
from instagram_web_api import Client, ClientCompatPatch, ClientError, ClientLoginError
import hashlib
import string
import random
import json


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

