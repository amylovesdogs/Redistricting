#################################################
# Import Libraries
#################################################
import pandas as pd
# database
import sqlite3

# flask app
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin

# json
import json

#################################################
# Database Setup
#################################################
# connect to the sqlite3 database and read in all the tables
# as dataframes
conn = sqlite3.connect('../database/redistricting_data.db')
pvi_df = pd.read_sql_query('SELECT * FROM pvi', conn)
generic2022_df = pd.read_sql_query('SELECT * FROM generic2022', conn)
current_map_df = pd.read_sql_query('SELECT * FROM currentmap', conn)
alpha_map_df = pd.read_sql_query('SELECT * FROM alphamap', conn)
bravo_map_df = pd.read_sql_query('SELECT * FROM bravomap', conn)
voters_df = pd.read_sql_query('SELECT * FROM voters', conn)

#################################################
# Data Computation
#################################################
# organize and compute needed data for each district map
current_map_df.set_index('id', inplace=True)
current_map_df['PVI DEM'] = pvi_df.groupby(['Current']).mean()['PVI DEM']
current_map_df['PVI REP'] = pvi_df.groupby(['Current']).mean()['PVI REP']
current_map_df['2022 DEM'] = generic2022_df.groupby(['Current']).mean()['2022 Assessor DEM %']
current_map_df['2022 REP'] = generic2022_df.groupby(['Current']).mean()['2022 Assessor REP %']
current_map_df.reset_index()
current_map_info = current_map_df.to_json(orient ='records')

alpha_map_df.set_index('id', inplace=True)
alpha_map_df['PVI DEM'] = pvi_df.groupby(['Current']).mean()['PVI DEM']
alpha_map_df['PVI REP'] = pvi_df.groupby(['Current']).mean()['PVI REP']
alpha_map_df['2022 DEM'] = generic2022_df.groupby(['Current']).mean()['2022 Assessor DEM %']
alpha_map_df['2022 REP'] = generic2022_df.groupby(['Current']).mean()['2022 Assessor REP %']
alpha_map_df.reset_index()
alpha_map_info = alpha_map_df.to_json(orient ='records')

bravo_map_df.set_index('id', inplace=True)
bravo_map_df['PVI DEM'] = pvi_df.groupby(['Current']).mean()['PVI DEM']
bravo_map_df['PVI REP'] = pvi_df.groupby(['Current']).mean()['PVI REP']
bravo_map_df['2022 DEM'] = generic2022_df.groupby(['Current']).mean()['2022 Assessor DEM %']
bravo_map_df['2022 REP'] = generic2022_df.groupby(['Current']).mean()['2022 Assessor REP %']
bravo_map_df.reset_index()
bravo_map_info = bravo_map_df.to_json(orient ='records')

#################################################
# Read in district borders as geojson files
#################################################
# precincts
with open('../static/data/2020-precincts.geojson') as f:
   precincts = json.load(f)

# current county commission districts
with open('../static/data/2017-CC-districts.geojson') as f:
   cc_districts = json.load(f)

# proposal 1, new county commission districts
with open('../static/data/alpha-CC-districts.geojson') as f:
   alpha = json.load(f)

# proposal 2, new county commission districts
with open('../static/data/bravo-CC-districts.geojson') as f:
   bravo = json.load(f)

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

# Return geojson for the alpha county commissioner district lines
@app.route("/api/v1.0/district-lines/alpha")
def alpha_district_lines():
    return alpha

# Return geojson for the bravo county commissioner district lines
@app.route("/api/v1.0/district-lines/bravo")
def bravo_district_lines():
    return bravo

# Return json for the current county commissioner district census and election info
@app.route("/api/v1.0/district-info/cc")
def current_district_info():
    return current_map_info

# Return json for the alpha county commissioner district census and election info
@app.route("/api/v1.0/district-info/alpha")
def alpha_district_info():
    return alpha_map_info

# Return json for the bravo county commissioner district census and election info
@app.route("/api/v1.0/district-info/bravo")
def bravo_district_info():
    return bravo_map_info

#################################################
# Run the Application
#################################################
if __name__ == '__main__':
    app.run(debug=True)
