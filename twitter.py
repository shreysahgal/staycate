import tweepy
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="Hackcation")

consumer_key = 'OFfe3Oa14aAYhwGcx7EbS4huQ'
consumer_secret = 'idvnjh3XVE7Yb2FfkcurxFwBgNQzgnHduqrk3sK2HkImboctQU'
access_token = '991485232711946240-qcB26eTsD8jxc1dMU5WoDv659oGrAsk'
access_token_secret = '9ygOFGU0dsmbDSmLJ5esSUkKxrXVOAyrJ2jlXYrpxVpUS'

auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)

# location = geolocator.reverse("40.7128, 74.0060")
location = "40.71427,-74.00597,10mi"
search = tweepy.Cursor(api.search,q="staycation",count=1000,geocode=location)
# search = api.search(q="vacation", rpp=100, geocode=location, show_user=True)
texts = []
for tweet in search.items(100):
    if not tweet.text in texts:
        texts.append(tweet.text)
        print(tweet.text)

# public_tweets = api.home_timeline()
# for tweet in public_tweets:
#     print(tweet.user.name)