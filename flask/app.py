#################################################
# Import Libraries
#################################################

# date/time functions
from time import strptime
from dateutil.relativedelta import relativedelta
from datetime import date

# Python SQL toolkit and Object Relational Mapper
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy import desc

# flask app
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

# json
import json

#################################################
# Database Setup
#################################################
# create engine to hawaii.sqlite
# engine = create_engine("sqlite:///Resources/hawaii.sqlite?check_same_thread=False")
# reflect an existing database into a new model
# Create the inspector and connect it to the engine
# Base = automap_base()
# Base.prepare(autoload_with=engine)

# reflect the tables
# View all of the classes that automap found
# classes = Base.classes.keys()
# Measurement = Base.classes.measurement
# Station = Base.classes.station

# Create our session (link) from Python to the DB
# session = Session(bind=engine)


#################################################
# Read in precinct borders as geojson files
#################################################
with open('../static/data/2020-precincts.geojson') as f:
   precincts = json.load(f)

with open('../static/data/2017-CC-districts.geojson') as f:
   cc_districts = json.load(f)

with open('../static/data/alpha-CC-districts.geojson') as f:
   alpha = json.load(f)

with open('../static/data/bravo-CC-districts.geojson') as f:
   bravo = json.load(f)

#################################################
# Data Functions
#################################################
# Return the most recent measurement date
# Returns a date in string format


#################################################
# Flask Setup
#################################################
app = Flask(__name__)
CORS(app)

#################################################
# Flask Routes
#################################################

# Home Page, documents the routes
@app.route("/")
def welcome():
    return (
        f"Welcome to to the El Paso County, CO district data API!<br/>"
        f"Available Routes:<br/>"
        f"<b>/api/v1.0/district-lines/precincts</b>      Returns geojson data for the El Paso County, CO precinct lines<br/>"
        f"<b>/api/v1.0/district-lines/cc</b>             Returns geojson data for the El Paso County, CO County Commissioner district lines<br/>"
        f"<b>/api/v1.0/district-lines/alpha</b>          Returns geojson data for the alpha proposed County Commissioner district lines<br/>"
        f"<b>/api/v1.0/ditrict-lines/bravo</b>           Returns geojson data for the bravo proposed County Commissioner district line<br/>"
    )

# Return geojson for the county precinct lines
@app.route("/api/v1.0/district-lines/precincts")
def precinct_lines():
    return precincts

# Return geojson for the current county commissioner district lines
@app.route("/api/v1.0/district-lines/cc")
def current_district_lines():
    return cc_districts

# Return the last year of temperature data for the most active weather station
@app.route("/api/v1.0/district-lines/alpha")
def alpha_district_lines():
    return alpha

# Return the last year of temperature data for the most active weather station
@app.route("/api/v1.0/district-lines/bravo")
def bravo_district_lines():
    return bravo


#################################################
# Run the Application
#################################################
if __name__ == '__main__':
    app.run(debug=True)
