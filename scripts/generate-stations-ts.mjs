import { readFileSync } from "fs";

const scraped = JSON.parse(readFileSync("scripts/scraped-stations.json", "utf8"));

const stationRenames = {
  "Ronald Reagan WashingtonNational Airport": "Washington National Airport",
};

for (const s of scraped) {
  if (stationRenames[s.name]) s.name = stationRenames[s.name];
}

// MBTA, SEPTA, and GCRTA don't have opening dates in their Wikipedia tables,
// so we maintain these manually.
const manual = [
  // MBTA (Boston) — from individual station/line articles
  { name: "Park Street", system: "mbta", line: "Green/Red", opened: "1897-09-01", wiki: "Park_Street_station_(MBTA)" },
  { name: "Boylston", system: "mbta", line: "Green", opened: "1897-09-01", wiki: "Boylston_station" },
  { name: "Arlington", system: "mbta", line: "Green", opened: "1897-09-01", wiki: "Arlington_station_(MBTA)" },
  { name: "Copley", system: "mbta", line: "Green", opened: "1897-09-01", wiki: "Copley_station" },
  { name: "Government Center", system: "mbta", line: "Green/Blue", opened: "1898-09-03", wiki: "Government_Center_station_(MBTA)" },
  { name: "Haymarket", system: "mbta", line: "Green/Orange", opened: "1898-06-10", wiki: "Haymarket_station_(MBTA)" },
  { name: "North Station", system: "mbta", line: "Green/Orange", opened: "1898-06-10", wiki: "North_Station_(MBTA)" },
  { name: "Downtown Crossing", system: "mbta", line: "Red/Orange", opened: "1908-12-30", wiki: "Downtown_Crossing_station" },
  { name: "Harvard", system: "mbta", line: "Red", opened: "1912-03-23", wiki: "Harvard_station_(MBTA)" },
  { name: "Central", system: "mbta", line: "Red", opened: "1912-03-23", wiki: "Central_station_(MBTA)" },
  { name: "Kendall/MIT", system: "mbta", line: "Red", opened: "1912-03-23", wiki: "Kendall/MIT_station" },
  { name: "South Station", system: "mbta", line: "Red", opened: "1916-12-03", wiki: "South_Station_(MBTA)" },
  { name: "Andrew", system: "mbta", line: "Red", opened: "1918-06-29", wiki: "Andrew_station_(MBTA)" },
  { name: "Broadway", system: "mbta", line: "Red", opened: "1918-06-29", wiki: "Broadway_station_(MBTA)" },
  { name: "JFK/UMass", system: "mbta", line: "Red", opened: "1927-11-05", wiki: "JFK/UMass_station" },
  { name: "Savin Hill", system: "mbta", line: "Red", opened: "1927-11-05", wiki: "Savin_Hill_station" },
  { name: "Fields Corner", system: "mbta", line: "Red", opened: "1927-11-05", wiki: "Fields_Corner_station" },
  { name: "Shawmut", system: "mbta", line: "Red", opened: "1928-09-01", wiki: "Shawmut_station_(MBTA)" },
  { name: "Ashmont", system: "mbta", line: "Red", opened: "1928-09-01", wiki: "Ashmont_station" },
  { name: "Alewife", system: "mbta", line: "Red", opened: "1985-03-30", wiki: "Alewife_station" },
  { name: "Davis", system: "mbta", line: "Red", opened: "1984-12-08", wiki: "Davis_station_(MBTA)" },
  { name: "Porter", system: "mbta", line: "Red", opened: "1984-12-08", wiki: "Porter_station_(MBTA)" },
  { name: "Charles/MGH", system: "mbta", line: "Red", opened: "1932-03-05", wiki: "Charles/MGH_station" },
  { name: "Park Street Under", system: "mbta", line: "Red", opened: "1912-03-23", wiki: "Park_Street_station_(MBTA)" },
  { name: "Quincy Center", system: "mbta", line: "Red", opened: "1971-09-01", wiki: "Quincy_Center_station" },
  { name: "Quincy Adams", system: "mbta", line: "Red", opened: "1983-09-10", wiki: "Quincy_Adams_station" },
  { name: "Braintree", system: "mbta", line: "Red", opened: "1980-03-22", wiki: "Braintree_station_(MBTA)" },
  { name: "North Quincy", system: "mbta", line: "Red", opened: "1971-09-01", wiki: "North_Quincy_station" },
  { name: "Wollaston", system: "mbta", line: "Red", opened: "1971-09-01", wiki: "Wollaston_station" },
  { name: "State Street", system: "mbta", line: "Blue/Orange", opened: "1904-12-30", wiki: "State_station_(MBTA)" },
  { name: "Aquarium", system: "mbta", line: "Blue", opened: "1904-12-30", wiki: "Aquarium_station_(MBTA)" },
  { name: "Maverick", system: "mbta", line: "Blue", opened: "1904-12-30", wiki: "Maverick_station" },
  { name: "Airport", system: "mbta", line: "Blue", opened: "1952-01-21", wiki: "Airport_station_(MBTA)" },
  { name: "Wood Island", system: "mbta", line: "Blue", opened: "1952-01-21", wiki: "Wood_Island_station" },
  { name: "Orient Heights", system: "mbta", line: "Blue", opened: "1952-01-21", wiki: "Orient_Heights_station" },
  { name: "Suffolk Downs", system: "mbta", line: "Blue", opened: "1954-01-19", wiki: "Suffolk_Downs_station" },
  { name: "Beachmont", system: "mbta", line: "Blue", opened: "1954-01-19", wiki: "Beachmont_station" },
  { name: "Revere Beach", system: "mbta", line: "Blue", opened: "1954-01-19", wiki: "Revere_Beach_station" },
  { name: "Wonderland", system: "mbta", line: "Blue", opened: "1954-01-19", wiki: "Wonderland_station" },
  { name: "Bowdoin", system: "mbta", line: "Blue", opened: "1916-03-18", wiki: "Bowdoin_station" },
  { name: "Chinatown", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Chinatown_station_(MBTA)" },
  { name: "Tufts Medical Center", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Tufts_Medical_Center_station" },
  { name: "Back Bay", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Back_Bay_station" },
  { name: "Massachusetts Avenue", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Massachusetts_Avenue_station_(MBTA)" },
  { name: "Ruggles", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Ruggles_station" },
  { name: "Roxbury Crossing", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Roxbury_Crossing_station" },
  { name: "Jackson Square", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Jackson_Square_station_(MBTA)" },
  { name: "Stony Brook", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Stony_Brook_station_(MBTA)" },
  { name: "Green Street", system: "mbta", line: "Orange", opened: "1987-05-04", wiki: "Green_Street_station_(MBTA)" },
  { name: "Forest Hills", system: "mbta", line: "Orange", opened: "1987-12-19", wiki: "Forest_Hills_station_(MBTA)" },
  { name: "Sullivan Square", system: "mbta", line: "Orange", opened: "1901-06-10", wiki: "Sullivan_Square_station" },
  { name: "Community College", system: "mbta", line: "Orange", opened: "1975-04-07", wiki: "Community_College_station_(MBTA)" },
  { name: "Wellington", system: "mbta", line: "Orange", opened: "1975-04-07", wiki: "Wellington_station_(MBTA)" },
  { name: "Malden Center", system: "mbta", line: "Orange", opened: "1975-04-07", wiki: "Malden_Center_station" },
  { name: "Oak Grove", system: "mbta", line: "Orange", opened: "1977-03-20", wiki: "Oak_Grove_station" },
  { name: "Assembly", system: "mbta", line: "Orange", opened: "2014-09-02", wiki: "Assembly_station_(MBTA)" },

  // SEPTA (Philadelphia) — Broad Street Line + Market-Frankford Line
  { name: "Fern Rock Transportation Center", system: "septa", line: "Broad Street", opened: "1956-09-09", wiki: "Fern_Rock_Transportation_Center" },
  { name: "Olney Transportation Center", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Olney_Transportation_Center" },
  { name: "Logan", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Logan_station_(SEPTA)" },
  { name: "Wyoming", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Wyoming_station_(SEPTA)" },
  { name: "Hunting Park", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Hunting_Park_station" },
  { name: "Erie", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Erie_station_(SEPTA)" },
  { name: "North Philadelphia", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "North_Philadelphia_station_(SEPTA)" },
  { name: "Susquehanna–Dauphin", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Susquehanna–Dauphin_station" },
  { name: "Cecil B. Moore", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Cecil_B._Moore_station" },
  { name: "Girard", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Girard_station_(Broad_Street_Line)" },
  { name: "Fairmount", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Fairmount_station_(SEPTA)" },
  { name: "Spring Garden", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Spring_Garden_station_(Broad_Street_Line)" },
  { name: "Race–Vine", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Race–Vine_station" },
  { name: "City Hall", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "City_Hall_station_(SEPTA)" },
  { name: "Walnut–Locust", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Walnut–Locust_station" },
  { name: "Lombard–South", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Lombard–South_station" },
  { name: "Ellsworth–Federal", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Ellsworth–Federal_station" },
  { name: "Tasker–Morris", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Tasker–Morris_station" },
  { name: "Snyder", system: "septa", line: "Broad Street", opened: "1928-09-01", wiki: "Snyder_station" },
  { name: "Oregon", system: "septa", line: "Broad Street", opened: "1938-10-02", wiki: "Oregon_station_(SEPTA)" },
  { name: "AT&T", system: "septa", line: "Broad Street", opened: "1973-09-06", wiki: "AT&T_station_(SEPTA)" },
  { name: "NRG", system: "septa", line: "Broad Street", opened: "1973-09-06", wiki: "NRG_station" },
  { name: "69th Street Transportation Center", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "69th_Street_Transportation_Center" },
  { name: "Millbourne", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "Millbourne_station" },
  { name: "63rd Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "63rd_Street_station_(SEPTA)" },
  { name: "60th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "60th_Street_station_(SEPTA)" },
  { name: "56th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "56th_Street_station_(SEPTA)" },
  { name: "52nd Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "52nd_Street_station_(SEPTA)" },
  { name: "46th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "46th_Street_station_(SEPTA)" },
  { name: "40th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "40th_Street_station_(Market–Frankford_Line)" },
  { name: "34th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "34th_Street_station_(Market–Frankford_Line)" },
  { name: "30th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "30th_Street_station_(Market–Frankford_Line)" },
  { name: "15th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "15th_Street_station_(Market–Frankford_Line)" },
  { name: "13th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "13th_Street_station_(Market–Frankford_Line)" },
  { name: "11th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "11th_Street_station_(Market–Frankford_Line)" },
  { name: "8th Street", system: "septa", line: "Market–Frankford", opened: "1907-03-04", wiki: "8th_Street_station_(Market–Frankford_Line)" },
  { name: "5th Street", system: "septa", line: "Market–Frankford", opened: "1907-10-04", wiki: "5th_Street_Independence_Hall_station" },
  { name: "2nd Street", system: "septa", line: "Market–Frankford", opened: "1907-10-04", wiki: "2nd_Street_station_(Market–Frankford_Line)" },
  { name: "Spring Garden", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Spring_Garden_station_(Market–Frankford_Line)" },
  { name: "Girard", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Girard_station_(Market–Frankford_Line)" },
  { name: "Berks", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Berks_station" },
  { name: "York–Dauphin", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "York–Dauphin_station" },
  { name: "Huntingdon", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Huntingdon_station_(SEPTA)" },
  { name: "Somerset", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Somerset_station_(SEPTA)" },
  { name: "Allegheny", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Allegheny_station_(SEPTA)" },
  { name: "Tioga", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Tioga_station_(SEPTA)" },
  { name: "Erie–Torresdale", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Erie–Torresdale_station" },
  { name: "Church", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Church_station_(Market–Frankford_Line)" },
  { name: "Margaret–Orthodox", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Margaret–Orthodox_station" },
  { name: "Frankford Transportation Center", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Frankford_Transportation_Center" },
  { name: "Arrott Transportation Center", system: "septa", line: "Market–Frankford", opened: "1922-11-05", wiki: "Arrott_Transportation_Center" },
  
  // GCRTA (Cleveland) — from individual station/line articles
  { name: "Airport", system: "gcrta", line: "Red", opened: "1968-11-15", wiki: "Cleveland_Hopkins_International_Airport_(RTA_Rapid_Transit_station)" },
  { name: "Brookpark", system: "gcrta", line: "Red", opened: "1969-04-20", wiki: "Brookpark_station" },
  { name: "Puritas–West 150th", system: "gcrta", line: "Red", opened: "1968-11-15", wiki: "Puritas–West_150th_station" },
  { name: "West Park", system: "gcrta", line: "Red", opened: "1958-11-15", wiki: "West_Park_station_(RTA_Rapid_Transit)" },
  { name: "Triskett", system: "gcrta", line: "Red", opened: "1958-11-15", wiki: "Triskett_station" },
  { name: "West 117th–Madison", system: "gcrta", line: "Red", opened: "1955-08-15", wiki: "West_117th–Madison_station" },
  { name: "West Boulevard–Cudell", system: "gcrta", line: "Red", opened: "1955-08-15", wiki: "West_Boulevard–Cudell_station" },
  { name: "West 65th–Lorain", system: "gcrta", line: "Red", opened: "1955-08-15", wiki: "West_65th–Lorain_station" },
  { name: "West 25th–Ohio City", system: "gcrta", line: "Red", opened: "1955-08-15", wiki: "West_25th–Ohio_City_station" },
  { name: "Tower City", system: "gcrta", line: "Red,Green,Blue,Waterfront", opened: "1955-03-15", wiki: "Tower_City_station" },
  { name: "Tri-C–Campus District", system: "gcrta", line: "Red,Green,Blue", opened: "1930-07-20", wiki: "Tri-C–Campus_District_station" },
  { name: "East 55th", system: "gcrta", line: "Red,Green,Blue", opened: "1920-04-11", wiki: "East_55th_station" },
  { name: "East 79th", system: "gcrta", line: "Red", opened: "1955-03-15", wiki: "East_79th_station_(GCRTA_Red_Line)" },
  { name: "East 105th–Quincy", system: "gcrta", line: "Red", opened: "1955-03-15", wiki: "East_105th–Quincy_station" },
  { name: "Cedar–University", system: "gcrta", line: "Red", opened: "1955-03-15", wiki: "Cedar–University_station" },
  // { name: "Euclid–East 120th", system: "gcrta", line: "Red", opened: "1955-03-15", wiki: "Euclid–East_120th_(RTA_Rapid_Transit_station)" },
  { name: "Little Italy-University Circle", system: "gcrta", line: "Red", opened: "2015-08-11", wiki: "Little_Italy–University_Circle_station" },
  { name: "Superior", system: "gcrta", line: "Red", opened: "1955-03-15", wiki: "Superior_station_(RTA_Rapid_Transit)" },
  { name: "Windermere", system: "gcrta", line: "Red", opened: "1955-03-15", wiki: "Windermere_(RTA_Rapid_Transit_station)" },
  { name: "South Harbor", system: "gcrta", line: "Waterfront", opened: "1996-07-10", wiki: "South_Harbor_station" },
  { name: "East 9th–North Coast", system: "gcrta", line: "Waterfront", opened: "1996-07-10", wiki: "East_9th–North_Coast_station" },
  { name: "Cleveland Lakefront-Amtrak", system: "gcrta", line: "Waterfront", opened: "1975-10-28", wiki: "Cleveland_Lakefront_Station" },
  { name: "West 3rd-Stadium", system: "gcrta", line: "Waterfront", opened: "1999-08-12", wiki: "West_3rd_station" },
  { name: "Flats East Bank", system: "gcrta", line: "Waterfront", opened: "1996-07-10", wiki: "Flats_East_Bank_station" },
  { name: "Settlers Landing", system: "gcrta", line: "Waterfront", opened: "1996-07-10", wiki: "Settlers_Landing_station" },
  { name: "East 79th", system: "gcrta", line: "Green,Blue", opened: "1920-04-11", wiki: "East_79th_station_(GCRTA_Blue_and_Green_Lines)" },
  { name: "Buckeye-Woodhill", system: "gcrta", line: "Green,Blue", opened: "1920-04-11", wiki: "Buckeye–Woodhill_station" },
  { name: "East 116th–St. Luke's", system: "gcrta", line: "Green,Blue", opened: "1920-04-11", wiki: "East_116th–St._Luke%27s_station" },
  { name: "Shaker Square", system: "gcrta", line: "Green,Blue", opened: "1920-04-11", wiki: "Shaker_Square_station" },
  { name: "Coventry", system: "gcrta", line: "Green", opened: "1913-12-17", wiki: "Coventry_station_(GCRTA)" },
  { name: "Southington", system: "gcrta", line: "Green", opened: "1913-12-17", wiki: "Southington_station_(GCRTA_Green_Line)" },
  { name: "South Park", system: "gcrta", line: "Green", opened: "1913-12-17", wiki: "South_Park_station_(GCRTA)" },
  { name: "Lee–Shaker", system: "gcrta", line: "Green", opened: "1913-12-17", wiki: "Lee_–_Shaker_(RTA_Rapid_Transit_station)" },
  { name: "Attleboro", system: "gcrta", line: "Green", opened: "1913-12-17", wiki: "Attleboro_station_(GCRTA)" },
  { name: "Eaton", system: "gcrta", line: "Green", opened: "1915-05-20", wiki: "Eaton_station" },
  { name: "Courtland", system: "gcrta", line: "Green", opened: "1915-05-20", wiki: "Courtland_station" },
  { name: "Warrensville–Shaker", system: "gcrta", line: "Green", opened: "1928-12-06", wiki: "Warrensville–Shaker_station" },
  { name: "Belvoir", system: "gcrta", line: "Green", opened: "1936-11-01", wiki: "Belvoir_station" },
  { name: "West Green", system: "gcrta", line: "Green", opened: "1936-11-01", wiki: "West_Green_station" },
  { name: "Green Road", system: "gcrta", line: "Green", opened: "1936-11-01", wiki: "Green_Road_station" },
  { name: "Drexmore", system: "gcrta", line: "Blue", opened: "1948-01-23", wiki: "Drexmore_station" },
  { name: "South Woodland", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "South_Woodland_station" },
  { name: "Southington", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Southington_station_(GCRTA_Blue_Line)" },
  { name: "Onaway", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Onaway_station" },
  { name: "Ashby", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Ashby_station_(GCRTA)" },
  { name: "Lee-Van Aken", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Lee–Van_Aken_station" },
  { name: "Avalon", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Avalon_station_(GCRTA)" },
  { name: "Kenmore", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Kenmore_station_(GCRTA)" },
  { name: "Lynnfield", system: "gcrta", line: "Blue", opened: "1920-04-11", wiki: "Lynnfield_station" },
  { name: "Farnsleigh", system: "gcrta", line: "Blue", opened: "1930-07-30", wiki: "Farnsleigh_station" },
  { name: "Warrensville–Van Aken", system: "gcrta", line: "Blue", opened: "1930-07-30", wiki: "Warrensville–Van_Aken_station" },
];

// NYC station complexes: physically connected stations that should be merged
// into a single entry with all routes listed.
// Source: https://en.wikipedia.org/wiki/New_York_City_Subway_stations#Station_complexes
const nycComplexes = [
  {
    name: "14th Street/Sixth Avenue",
    wiki: "14th_Street/Sixth_Avenue_station",
    routes: "1,2,3,F,L,M",
    merge: ["14th Street/Sixth Avenue"],
  },
  {
    name: "14th Street/Eighth Avenue",
    wiki: "14th_Street/Eighth_Avenue_station",
    routes: "A,C,E,L",
    merge: ["14th Street/Eighth Avenue"],
  },
  {
    name: "14th Street–Union Square",
    wiki: "14th_Street–Union_Square_station",
    routes: "4,5,6,L,N,Q,R,W",
    merge: ["14th Street–Union Square"],
  },
  {
    name: "34th Street–Herald Square",
    wiki: "34th_Street–Herald_Square_station",
    routes: "B,D,F,M,N,Q,R,W",
    merge: ["34th Street–Herald Square"],
  },
  {
    name: "42nd Street–Bryant Park/Fifth Avenue",
    wiki: "42nd_Street–Bryant_Park/Fifth_Avenue_station",
    routes: "7,B,D,F,M",
    merge: ["42nd Street–Bryant Park/Fifth Avenue"],
  },
  {
    name: "59th Street–Columbus Circle",
    wiki: "59th_Street–Columbus_Circle_station",
    routes: "1,A,B,C,D",
    merge: ["59th Street–Columbus Circle"],
  },
  {
    name: "149th Street–Grand Concourse",
    wiki: "149th_Street–Grand_Concourse_(New_York_City_Subway)",
    routes: "2,4,5",
    merge: ["149th Street–Grand Concourse"],
  },
  {
    name: "161st Street–Yankee Stadium",
    wiki: "161st_Street–Yankee_Stadium_station",
    routes: "4,B,D",
    merge: ["161st Street–Yankee Stadium"],
  },
  {
    name: "168th Street",
    wiki: "168th_Street_station_(New_York_City_Subway)",
    routes: "1,A,C",
    merge: ["168th Street"],
  },
  {
    name: "Atlantic Avenue–Barclays Center",
    wiki: "Atlantic_Avenue–Barclays_Center_station",
    routes: "2,3,4,5,B,D,N,Q,R,W",
    merge: ["Atlantic Avenue–Barclays Center", "Atlantic Avenue"],
  },
  {
    name: "Borough Hall/Court Street",
    wiki: "Borough_Hall/Court_Street_station",
    routes: "2,3,4,5,R",
    merge: ["Borough Hall/Court Street"],
  },
  {
    name: "Broadway–Lafayette Street/Bleecker Street",
    wiki: "Broadway–Lafayette_Street/Bleecker_Street_station",
    routes: "6,B,D,F,M",
    merge: ["Broadway–Lafayette Street/Bleecker Street"],
  },
  {
    name: "Broadway Junction",
    wiki: "Broadway_Junction_station",
    routes: "A,C,J,L,Z",
    merge: ["Broadway Junction"],
  },
  {
    name: "Brooklyn Bridge–City Hall/Chambers Street",
    wiki: "Brooklyn_Bridge–City_Hall/Chambers_Street_station",
    routes: "4,5,6,J,Z",
    merge: ["Brooklyn Bridge–City Hall/Chambers Street"],
  },
  {
    name: "Canal Street",
    wiki: "Canal_Street_station_(New_York_City_Subway)",
    routes: "6,J,N,Q,R,W,Z",
    merge: ["Canal Street"],
  },
  {
    name: "Chambers Street–World Trade Center/Park Place/Cortlandt Street",
    wiki: "Chambers_Street–World_Trade_Center/Park_Place/Cortlandt_Street_station",
    routes: "2,3,A,C,E,R,W",
    merge: ["Chambers Street–World Trade Center/Park Place/Cortlandt Street", "Chambers Street"],
  },
  {
    name: "Court Square–23rd Street",
    wiki: "Court_Square–23rd_Street_station",
    routes: "7,E,F,G",
    merge: ["Court Square–23rd Street"],
  },
  {
    name: "Delancey Street/Essex Street",
    wiki: "Delancey_Street/Essex_Street_station",
    routes: "F,J,M,Z",
    merge: ["Delancey Street/Essex Street"],
  },
  {
    name: "Fourth Avenue/Ninth Street",
    wiki: "Fourth_Avenue/Ninth_Street_station",
    routes: "F,G,R",
    merge: ["Fourth Avenue/Ninth Street"],
  },
  {
    name: "Franklin Avenue/Botanic Garden",
    wiki: "Franklin_Avenue/Botanic_Garden_station",
    routes: "2,3,4,5,S",
    merge: ["Franklin Avenue/Botanic Garden"],
  },
  {
    name: "Franklin Avenue",
    wiki: "Franklin_Avenue_station_(Fulton_Street)",
    routes: "C,S",
    merge: ["Franklin Avenue"],
  },
  {
    name: "Fulton Street",
    wiki: "Fulton_Street_station_(New_York_City_Subway)",
    routes: "2,3,4,5,A,C,J,Z",
    merge: ["Fulton Street"],
  },
  {
    name: "Grand Central–42nd Street",
    wiki: "Grand_Central–42nd_Street_station",
    routes: "4,5,6,7,S",
    merge: ["Grand Central–42nd Street"],
  },
  {
    name: "Jay Street–MetroTech",
    wiki: "Jay_Street–MetroTech_station",
    routes: "A,C,F,R",
    merge: ["Jay Street–MetroTech"],
  },
  {
    name: "Lexington Avenue/51st Street",
    wiki: "Lexington_Avenue/51st_Street_station",
    routes: "6,E,F",
    merge: ["Lexington Avenue/51st Street"],
  },
  {
    name: "Lexington Avenue/59th Street",
    wiki: "Lexington_Avenue/59th_Street_station",
    routes: "4,5,6,N,R,W",
    merge: ["Lexington Avenue/59th Street"],
  },
  {
    name: "Metropolitan Avenue/Lorimer Street",
    wiki: "Metropolitan_Avenue/Lorimer_Street_station",
    routes: "G,L",
    merge: ["Metropolitan Avenue/Lorimer Street"],
  },
  {
    name: "Myrtle–Wyckoff Avenues",
    wiki: "Myrtle–Wyckoff_Avenues_station",
    routes: "L,M",
    merge: ["Myrtle–Wyckoff Avenues"],
  },
  {
    name: "62nd Street/New Utrecht Avenue",
    wiki: "62nd_Street/New_Utrecht_Avenue_station",
    routes: "D,N",
    merge: ["62nd Street/New Utrecht Avenue"],
  },
  {
    name: "Jackson Heights–Roosevelt Avenue/74th Street",
    wiki: "Jackson_Heights–Roosevelt_Avenue/74th_Street_station",
    routes: "7,E,F,M,R",
    merge: ["Jackson Heights–Roosevelt Avenue/74th Street"],
  },
  {
    name: "South Ferry/Whitehall Street",
    wiki: "South_Ferry/Whitehall_Street_station",
    routes: "1,R,W",
    merge: ["South Ferry/Whitehall Street"],
  },
  {
    name: "Times Square–42nd Street",
    wiki: "Times_Square–42nd_Street_station",
    routes: "1,2,3,7,A,C,E,N,Q,R,W,S",
    merge: [
      "Times Square–42nd Street",
      "Times Square–42nd Street/Port Authority Bus Terminal/Bryant Park/Fifth Avenue",
      "42nd Street–Port Authority Bus Terminal",
    ],
  },
];

function applyNycComplexes(stations) {
  const mergeTargets = new Set();
  for (const complex of nycComplexes) {
    for (const name of complex.merge) mergeTargets.add(name);
  }

  const result = [];
  const consumed = new Set();

  for (const s of stations) {
    if (s.system !== "nyc" || !mergeTargets.has(s.name)) {
      result.push(s);
      continue;
    }
    if (consumed.has(s.name)) continue;

    const complex = nycComplexes.find((c) => c.merge.includes(s.name));
    if (!complex || consumed.has(complex.name + "__done")) continue;

    // Find all entries to merge
    const components = stations.filter(
      (st) => st.system === "nyc" && complex.merge.includes(st.name)
    );
    for (const c of components) consumed.add(c.name);
    consumed.add(complex.name + "__done");

    // Use earliest opening date
    const earliest = components.reduce((a, b) =>
      a.opened < b.opened ? a : b
    );

    // Prefer coords from the complex's primary entry, then any component
    const primaryCoords = components.find((c) => c.name === complex.name);
    const coordSource = primaryCoords || components.find((c) => c.coords);

    result.push({
      name: complex.name,
      system: "nyc",
      line: earliest.line,
      opened: earliest.opened,
      wiki: complex.wiki,
      coords: coordSource?.coords,
      routes: complex.routes,
    });
  }

  return result;
}

const allStations = applyNycComplexes([...scraped, ...manual]);

// Sort by system then by name
allStations.sort((a, b) => {
  if (a.system !== b.system) return a.system.localeCompare(b.system);
  return a.name.localeCompare(b.name);
});

// Batch-fetch coordinates from Wikipedia API
async function fetchCoordinates(stations) {
  const wikiStations = stations.filter((s) => s.wiki);
  const coords = {};
  const batchSize = 25;

  for (let i = 0; i < wikiStations.length; i += batchSize) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1500));
    const batch = wikiStations.slice(i, i + batchSize);
    const titles = batch.map((s) => s.wiki).join("|");
    const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(titles)}&prop=coordinates&format=json&redirects=1`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "SubwayParty/1.0 (transit birthday tracker; ecormany@gmail.com)" },
      });
      const data = await res.json();

      // Build forward chains: original slug (with underscores) → final resolved title
      const normalizedMap = {};
      for (const n of data.query?.normalized || []) normalizedMap[n.from] = n.to;
      const redirectMap = {};
      for (const r of data.query?.redirects || []) redirectMap[r.from] = r.to;

      // For each slug, follow: slug → normalize → redirect → final title
      // Then build reverse map: final title → slug
      const finalTitleToSlug = {};
      for (const s of batch) {
        let title = s.wiki;
        if (normalizedMap[title]) title = normalizedMap[title];
        else title = title.replace(/_/g, " ");
        if (redirectMap[title]) title = redirectMap[title];
        finalTitleToSlug[title] = s.wiki;
      }

      const pages = data.query?.pages || {};
      for (const page of Object.values(pages)) {
        if (page.coordinates && page.coordinates.length > 0) {
          const c = page.coordinates[0];
          const slug = finalTitleToSlug[page.title];
          if (slug) {
            coords[slug] = [c.lat, c.lon];
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching coords batch at ${i}: ${err.message}`);
    }
  }

  console.error(`Fetched coordinates for ${Object.keys(coords).length} of ${wikiStations.length} stations`);
  return coords;
}

async function main() {
  const coords = await fetchCoordinates(allStations);

  // Generate TypeScript
  const lines = [];
  lines.push(`export interface Station {
  name: string;
  system: string;
  line: string;
  opened: string; // YYYY-MM-DD
  wiki?: string;
  coords?: [number, number]; // [lat, lng]
  routes?: string;
}

export const systems: Record<string, { name: string; city: string; color: string; emoji: string }> = {
  nyc: { name: "New York City Subway", city: "New York", color: "#0039A6", emoji: "🗽" },
  wmata: { name: "Washington Metro", city: "Washington, DC", color: "#BF0D3E", emoji: "🏛️" },
  cta: { name: "Chicago L", city: "Chicago", color: "#565A5C", emoji: "🌬️" },
  bart: { name: "BART", city: "San Francisco Bay Area", color: "#009DDC", emoji: "🌉" },
  mbta: { name: "MBTA", city: "Boston", color: "#003DA5", emoji: "🦞" },
  septa: { name: "SEPTA", city: "Philadelphia", color: "#E1251B", emoji: "🔔" },
  marta: { name: "MARTA", city: "Atlanta", color: "#CE8B3A", emoji: "🍑" },
  gcrta: { name: "GCRTA", city: "Cleveland", color: "#D7192A", emoji: "🎸" },
};

export const stations: Station[] = [`);

  for (const s of allStations) {
    const name = s.name.replace(/"/g, '\\"');
    const line = (s.line || "").replace(/"/g, '\\"');
    const wiki = s.wiki ? `, wiki: "${s.wiki.replace(/"/g, '\\"')}"` : "";
    const c = s.wiki && coords[s.wiki]
      ? `, coords: [${coords[s.wiki][0]}, ${coords[s.wiki][1]}]`
      : s.coords
        ? `, coords: [${s.coords[0]}, ${s.coords[1]}]`
        : "";
    const routes = s.routes ? `, routes: "${s.routes}"` : "";
    lines.push(`  { name: "${name}", system: "${s.system}", line: "${line}", opened: "${s.opened}"${wiki}${c}${routes} },`);
  }

  lines.push(`];

export function getTodaysBirthdays(month: number, day: number): Station[] {
  return stations.filter((s) => {
    const d = new Date(s.opened);
    return d.getUTCMonth() + 1 === month && d.getUTCDate() === day;
  });
}

export function getUpcomingBirthdays(month: number, day: number, withinDays: number = 7): Station[] {
  const today = new Date(2000, month - 1, day);
  return stations.filter((s) => {
    const d = new Date(s.opened);
    const birthday = new Date(2000, d.getUTCMonth(), d.getUTCDate());
    const diff = (birthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff > 0 && diff <= withinDays;
  });
}

export function getAge(opened: string): number {
  const now = new Date();
  const d = new Date(opened);
  return now.getFullYear() - d.getUTCFullYear();
}

export function getStationsBySystem(systemId: string): Station[] {
  return stations.filter((s) => s.system === systemId);
}
`);

  console.log(lines.join("\n"));
}

main().catch(console.error);
