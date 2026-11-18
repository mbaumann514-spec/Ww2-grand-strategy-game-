# The rules that turn today's administrative units into the map of 1 September 1939.
#
# Ours, written from history: which state held which land that morning. No atlas was traced
# and no other game's region division was looked at. The LINES are Natural Earth's (public
# domain) wherever a border of 1939 runs along a unit of today; where it does not, a cut is
# written below as a short chain of points placed by the towns known to have lain on either
# side of it. A cut is good to ten or twenty kilometres, which is under a tenth of a region.
#
# Every deviation from the real border is named where it is made (search for "DEVIATION").
# bau_karte.py reads this file; nothing here is generated.

# The window of the map, in degrees. West of Ireland to the Urals, the North Cape to Upper Egypt.
WINDOW = dict(west=-11.5, east=62.0, south=26.0, north=71.6)

# ----------------------------------------------------------------------------------------
# 1. Who held a unit. `owner(a3, name, lon, lat)` is asked for every piece of every unit;
#    lon/lat are the piece's own middle, so an island can go another way than its mainland.
#    None leaves the piece off the map.
# ----------------------------------------------------------------------------------------

# Today's state -> the state of 1939, where the whole of it went one way.
SIMPLE = {
    "DEU": "GER", "AUT": "GER",          # the Anschluss, March 1938
    "CZE": "GER",                        # the Sudetenland (October 1938) and the Protectorate (March 1939)
    "FRA": "FRA", "MCO": "FRA",
    "DZA": "FRA", "TUN": "FRA",          # Algeria (departments) and the Tunisian protectorate
    "SYR": "FRA", "LBN": "FRA",          # the Levant mandate
    "GBR": "ENG", "IMN": "ENG",
    "MLT": "ENG", "GIB": "ENG", "CYP": "ENG", "CYN": "ENG", "ESB": "ENG", "WSB": "ENG",
    "ISR": "ENG", "PSX": "ENG", "JOR": "ENG",   # the Palestine mandate and Transjordan
    "KWT": "ENG",                        # a British protectorate
    "PAK": "ENG",                        # the corner of British Baluchistan the window shows
    "IRL": "IRE",
    "BEL": "BEL", "NLD": "HOL", "LUX": "LUX", "CHE": "SWI", "LIE": "SWI",
    "DNK": "DEN", "NOR": "NOR", "SWE": "SWE", "ALD": "FIN",
    "EST": "EST", "LVA": "LAT",
    "ESP": "SPA", "AND": "SPA", "PRT": "POR",
    "ITA": "ITA", "SMR": "ITA", "VAT": "ITA",
    "LBY": "ITA",                        # Italian Libya, its coast four provinces of the kingdom since January 1939
    "ALB": "ITA",                        # occupied in April 1939, the crown united with Italy's
    "BIH": "YUG", "SRB": "YUG", "KOS": "YUG", "MNE": "YUG", "MKD": "YUG",   # Slovenia is decided by the Rapallo line below
    "HUN": "HUN",                        # Slovakia is cut along the Vienna Award (see CUTS)
    "ROU": "ROM", "TUR": "TUR",          # Hatay joined Turkey in July 1939, and today's line is that one
    "IRQ": "IRQ", "IRN": "PER", "SAU": "SAU", "EGY": "EGY", "AFG": "AFG",
    "GEO": "SOV", "ARM": "SOV", "AZE": "SOV", "KAZ": "SOV", "TKM": "SOV", "UZB": "SOV",
}

# Poland's voivodeships of today that were German in 1939, whole.
# DEVIATION: the Grenzmark Posen-West Prussia (Schneidemuehl, Flatow, Fraustadt), a German
# strip on the west of today's Greater Poland, is drawn Polish; Soldau, Polish, is drawn German.
POL_GERMAN = {"West Pomeranian", "Lubusz", "Lower Silesian", "Opole", "Warmian-Masurian"}

# Ukraine's oblasts of today that were Polish (the Riga line of 1921 ran along their east).
UKR_POLISH = {"Volyn", "Rivne", "L'viv", "Ternopil'", "Ivano-Frankivs'k"}

# Moldova's districts east of the Dniester: the Moldavian ASSR, Soviet. The rest is Bessarabia, Romanian.
MDA_SOVIET = {"Transnistria", "Stîngă Nistrului", "Camenca", "Grigoriopol"}


def owner(a3, name, lon, lat):
    if a3 in SIMPLE:
        return SIMPLE[a3]
    if a3 == "POL":
        # Pomeranian and Silesian are cut (see CUTS) and their pieces decided there.
        return "GER" if name in POL_GERMAN else "POL"
    if a3 == "LTU":
        if name == "Vilniaus":
            # DEVIATION: the Polish Wilno land reached into today's Utena and Alytus counties too
            # (Swieciany, Druskieniki); only Vilnius county is drawn Polish.
            return "POL"
        if name == "Klaipedos":
            # Memel, ceded to Germany on 22 March 1939.
            # DEVIATION: today's county is wider than the Memel territory (Palanga, Kretinga were Lithuanian).
            return "GER"
        return "LIT"
    if a3 == "BLR":
        if name in ("Brest", "Grodno"):
            return "POL"
        return "SOV"   # Minsk and Vitebsk are cut
    if a3 == "UKR":
        if name in UKR_POLISH:
            return "POL"
        if name == "Transcarpathia":
            return "HUN"   # Carpatho-Ukraine, occupied by Hungary in March 1939
        if name == "Chernivtsi":
            return "ROM"   # northern Bukovina and the Hotin corner of Bessarabia
        return "SOV"       # Odessa is cut for southern Bessarabia
    if a3 == "MDA":
        return "SOV" if name in MDA_SOVIET else "ROM"
    if a3 == "BGR":
        # Southern Dobruja was Romanian from 1913 to September 1940.
        return "ROM" if name in ("Dobrich", "Silistra") else "BUL"
    if a3 == "HRV":
        if name == "Istarska":
            return "ITA"
        # Cres and Losinj (Cherso, Lussino), Italian since Rapallo, lie in a county of the mainland.
        if name == "Primorsko-Goranska" and 14.15 < lon < 14.62 and 44.40 < lat < 45.20:
            return "ITA"
        # DEVIATION: Fiume, Zara and Lagosta, Italian, are too small for this map and drawn Yugoslav.
        return "YUG"
    if a3 == "GRC":
        # The Dodecanese, Italian since 1912, share today's South Aegean region with the Cyclades.
        if name == "Notio Aigaio" and lon > 26.2:
            return "ITA"
        return "GRE"
    if a3 == "MAR":
        # The Spanish protectorate in the north (and Tangier's international zone, drawn with it).
        # DEVIATION: the Rif east of Tetuan (Alhucemas, Nador) is in units that were mostly French and is drawn French.
        return "SPA" if name == "Tanger - Tétouan" else "FRA"
    if a3 == "SVN":
        return owner_slovenia(lon, lat)
    if a3 == "SVK":
        return "SLO"
    if a3 == "FIN":
        return "FIN"
    if a3 == "RUS":
        if name == "Kaliningrad":
            return "GER"   # the north of East Prussia
        return "SOV"       # Leningrad, Karelia and Murmansk are cut for Finland's land of 1939
    return None


# ----------------------------------------------------------------------------------------
# 2. Cuts: where the border of 1939 crosses a unit of today. Each names the units it cuts,
#    a line in (lon, lat), and who gets the pieces: a piece goes to the entry whose `at`
#    point lies in it, or else to the nearest such point.
# ----------------------------------------------------------------------------------------

# DEVIATIONS of the borders drawn, beside those named where they are made: Zaolzie (Teschen west of the Olza, Polish
# since 2 October 1938) is drawn German with the Protectorate; Petseri and Jaanilinn (Estonian), Abrene (Latvian)
# and the strip of Salla and Kuusamo (Finnish until March 1940) are drawn Soviet; Lubawa and Nowe Miasto (Polish)
# are drawn German; Tenda and Briga (Italian) French; the Faroes and Bahrain are off the map. Danzig was still the
# Free City at 04:45 and was declared part of the Reich in the course of the day: it is drawn German from the start.
# Tangier was an international zone until Spain occupied it on 14 June 1940: it is drawn with the Spanish protectorate.

CUTS = [
    dict(
        note="The First Vienna Award of 2 November 1938 and the eastern strip Hungary took on 4 April 1939: Galanta, "
             "Ersekujvar, Komarom, Leva, Losonc, Rimaszombat, Rozsnyo, Kassa and Szobranc Hungarian; Bratislava, Nitra, "
             "Zvolen, Dobsina, Presov and Michalovce Slovak.",
        units=[("SVK", "Bratislavský"), ("SVK", "Trnavský"), ("SVK", "Nitriansky"), ("SVK", "Banskobystrický"), ("SVK", "Košický"), ("SVK", "Prešov")],
        line=[(17.00, 47.90), (17.20, 48.05), (17.32, 48.26), (17.75, 48.24), (18.15, 48.22), (18.45, 48.28), (18.75, 48.30),
              (19.00, 48.22), (19.55, 48.43), (20.00, 48.50), (20.45, 48.74), (21.10, 48.84), (21.45, 48.62), (21.75, 48.50),
              (21.95, 48.52), (22.05, 48.70), (22.10, 48.95), (22.25, 49.30)],
        pieces=[("HUN", (18.16, 47.99)), ("HUN", (17.73, 48.17)), ("HUN", (17.31, 48.03)), ("HUN", (18.61, 48.20)), ("HUN", (19.67, 48.31)),
                ("HUN", (20.02, 48.36)), ("HUN", (20.53, 48.62)), ("HUN", (21.26, 48.70)), ("HUN", (22.18, 48.74)), ("HUN", (22.08, 48.55)),
                ("SLO", (17.11, 48.15)), ("SLO", (18.09, 48.33)), ("SLO", (19.14, 48.58)), ("SLO", (20.37, 48.84)), ("SLO", (21.24, 49.00)),
                ("SLO", (21.92, 48.77)), ("SLO", (17.59, 48.38)), ("SLO", (19.15, 48.74)), ("SLO", (20.30, 49.06)), ("SLO", (21.91, 48.94)),
                ("SLO", (18.74, 49.22)), ("SLO", (17.27, 48.29))],
    ),
    dict(
        note="The Corridor's west side, 1920-1939: Lauenburg, Buetow, Rummelsburg and Schlochau German; "
             "Wejherowo, Kartuzy, Koscierzyna and Chojnice Polish.",
        units=[("POL", "Pomeranian")],
        line=[(18.02, 54.95), (17.97, 54.62), (17.90, 54.45), (17.70, 54.22), (17.45, 54.00), (17.46, 53.72), (17.36, 53.40)],
    ),
    dict(
        note="The Free City of Danzig (declared part of the Reich on 1 September 1939) and the Marienwerder district "
             "of East Prussia: Zoppot, Danzig, Tiegenhof, Marienburg, Stuhm and Marienwerder east of this line; "
             "Gdynia, Tczew and Gniew west of it. South of the Free City the line is the Vistula.",
        units=[("POL", "Pomeranian")],
        line=[(18.60, 54.60), (18.56, 54.47), (18.33, 54.33), (18.42, 54.17), (18.72, 54.12), (18.82, 54.08),
              (18.84, 53.92), (18.80, 53.80), (18.74, 53.62), (18.80, 53.40)],
        pieces=[("GER", (17.03, 54.46)), ("POL", (18.20, 54.33)), ("POL", (18.53, 54.52)), ("POL", (17.98, 54.12)),
                ("GER", (18.65, 54.35)), ("GER", (19.03, 54.04)), ("GER", (18.93, 53.73))],
    ),
    dict(
        note="Upper Silesia as divided in 1922: Gleiwitz, Hindenburg, Beuthen and Ratibor German; "
             "Kattowitz, Koenigshuette, Tarnowitz, Rybnik and Pless Polish.",
        units=[("POL", "Silesian")],
        line=[(18.45, 51.05), (18.52, 50.67), (18.66, 50.50), (18.82, 50.42), (18.97, 50.38), (18.93, 50.31),
              (18.80, 50.26), (18.62, 50.25), (18.45, 50.15), (18.33, 50.02), (18.30, 49.80)],
        pieces=[("GER", (18.67, 50.31)), ("GER", (18.22, 50.09)), ("POL", (19.02, 50.26)), ("POL", (19.12, 50.81)),
                ("POL", (19.05, 49.82)), ("POL", (18.54, 50.10))],
    ),
    dict(
        note="The Riga line of 1921 through today's Vitebsk and Minsk regions: Dzisna, Glebokie, Wilejka, "
             "Molodeczno, Stolpce, Nieswiez and Kleck Polish; Polotsk, Lepel, Minsk, Koidanovo and Slutsk Soviet.",
        units=[("BLR", "Vitebsk"), ("BLR", "Minsk")],
        line=[(27.60, 56.10), (27.66, 55.76), (28.22, 55.60), (28.15, 55.30), (27.98, 55.00), (27.93, 54.78),
              (27.55, 54.35), (27.33, 54.12), (27.10, 53.85), (26.95, 53.62), (26.92, 53.25), (27.05, 52.95),
              (27.25, 52.75), (27.45, 52.30)],
        pieces=[("POL", (27.69, 55.14)), ("POL", (26.86, 54.31)), ("POL", (26.67, 53.22)), ("POL", (26.64, 53.06)),
                ("SOV", (28.78, 55.49)), ("SOV", (30.20, 55.19)), ("SOV", (27.54, 53.02)), ("SOV", (28.50, 54.23)),
                ("SOV", (27.56, 53.90))],
    ),
    dict(
        note="Finland's border of 1920 on the Karelian Isthmus and round Lake Ladoga: Terijoki, Viipuri, "
             "Kaekisalmi, Sortavala and Suojaervi Finnish; Beloostrov, Leningrad, Olonets and Petrozavodsk Soviet.",
        units=[("RUS", "Leningrad"), ("RUS", "Karelia")],
        line=[(29.90, 59.90), (29.98, 60.14), (30.25, 60.36), (30.50, 60.47), (30.85, 60.60), (31.60, 61.00),
              (32.25, 61.28), (32.75, 61.60), (32.95, 61.95), (32.75, 62.25), (32.00, 62.50), (31.30, 62.58), (30.60, 62.65)],
        pieces=[("FIN", (28.75, 60.71)), ("FIN", (30.12, 61.03)), ("FIN", (30.67, 61.70)), ("FIN", (32.35, 62.08)),
                ("SOV", (30.32, 59.94)), ("SOV", (32.97, 60.98)), ("SOV", (34.35, 61.79)), ("SOV", (33.00, 59.50)),
                ("SOV", (33.50, 64.50)), ("SOV", (29.00, 59.40))],
    ),
    dict(
        note="Petsamo, Finland's from 1920 to 1944: Petsamo and Liinahamari Finnish, Murmansk and the Kola inlet Soviet.",
        units=[("RUS", "Murmansk")],
        line=[(32.30, 70.10), (32.05, 69.72), (31.50, 69.30), (30.90, 68.90), (30.00, 68.45), (29.20, 68.15), (28.00, 68.08)],
        pieces=[("FIN", (31.20, 69.50)), ("FIN", (30.20, 69.00)), ("SOV", (33.08, 68.97)), ("SOV", (34.00, 67.50)),
                ("SOV", (30.50, 67.20))],
    ),
    dict(
        note="Southern Bessarabia (the Budjak), Romanian: Cetatea Alba and Ismail west of the Dniester's estuary, "
             "Ovidiopol and Odessa east of it.",
        units=[("UKR", "Odessa")],
        line=[(29.95, 46.52), (30.10, 46.42), (30.25, 46.35), (30.40, 46.22), (30.50, 46.05), (30.55, 45.85)],
        pieces=[("ROM", (30.34, 46.19)), ("ROM", (28.83, 45.35)), ("ROM", (29.20, 46.00)),
                ("SOV", (30.73, 46.48)), ("SOV", (29.60, 47.60)), ("SOV", (30.44, 46.25))],
    ),
]

# The Rapallo border of 1920 through today's Slovenia: its municipalities are small enough to be
# given whole to one side by where their middle lies. West of this line Italian (Gorizia, Idria,
# Postumia); east of it Yugoslav (Ljubljana, Logatec, Cerknica).
RAPALLO = [(13.72, 46.60), (13.84, 46.38), (14.05, 46.20), (14.08, 46.03), (14.17, 45.92), (14.27, 45.82),
           (14.40, 45.70), (14.45, 45.58), (14.42, 45.40), (14.45, 45.20)]


def west_of(line, lon, lat):
    """Whether (lon, lat) lies west of a line that runs from north to south."""
    for (x0, y0), (x1, y1) in zip(line, line[1:]):
        if y1 <= lat <= y0:
            x = x0 + (x1 - x0) * (y0 - lat) / (y0 - y1) if y0 != y1 else x0
            return lon < x
    return False


def owner_slovenia(lon, lat):
    return "ITA" if west_of(RAPALLO, lon, lat) else "YUG"


# ----------------------------------------------------------------------------------------
# 3. Regions. A region grows round a town. Towns are taken by size, no two closer than the
#    spacing of their country, and the FORCED ones always: the places the war turned on.
# ----------------------------------------------------------------------------------------

def spacing(tag, lon, lat):
    """True kilometres between the towns of two regions: tight where the war was dense, wide in the east and the desert."""
    if tag in ("BEL", "HOL"):
        return 58
    if tag in ("GER", "ENG") and lat > 44:
        return 82 if lon < 40 else 300
    if tag in ("POL", "FRA", "ITA", "HUN", "SLO", "SWI", "DEN", "LIT", "LAT", "EST"):
        if tag in ("FRA", "ITA") and lat < 38.5:
            return 300          # North Africa and the Levant; the coast road's stations are FORCED
        return 92
    if tag in ("ROM", "BUL", "YUG", "GRE"):
        return 112
    if tag in ("SPA", "POR", "IRE"):
        return 140
    if tag in ("NOR", "SWE", "FIN"):
        return 140 if lat < 62 else 250
    if tag == "SOV":
        if lon > 52 or lat > 62 or (lat < 45 and lon > 46):
            return 300
        if lon < 37:
            return 120
        return 165
    if tag == "TUR":
        return 200
    if tag == "ENG":
        return 180               # Palestine, Transjordan, Cyprus
    return 300                   # Persia, Iraq, Arabia, Egypt, Afghanistan


# Towns that are a region whatever their size. By Natural Earth's own name for the place.
FORCED = [
    # the German-Polish frontier and the Baltic
    "Gdańsk", "Kaliningrad", "Gliwice", "Katowice", "Bydgoszcz", "Gdynia", "Brest", "Lviv", "Vilnius", "Klaipėda",
    # the west
    "Lille", "Calais", "Metz", "Strasbourg", "Saarbrücken", "Aachen", "Luxembourg", "Liège", "Antwerpen",
    "Rotterdam", "Brest", "Cherbourg", "Caen", "Dover", "Portsmouth", "Plymouth", "Scapa Flow",
    # Scandinavia
    "Narvik", "Trondheim", "Bergen", "Kristiansand", "Tromsø", "Kirkenes", "Kiruna", "Petsamo", "Vyborg",
    # the east
    "St.  Petersburg", "Murmansk", "Archangel", "Smolensk", "Sevastopol", "Kerch", "Odessa", "Rostov", "Volgograd",
    "Grozny", "Baku", "Maykop", "Novorossiysk", "Tula", "Kursk", "Kharkiv", "Kyiv", "Minsk", "Riga", "Tallinn",
    # the Balkans and the straits
    "Constanța", "Chișinău", "Chernivtsi", "Thessaloniki", "Iraklio", "Rodos", "Istanbul", "Edirne",
    "Tirana", "Trieste", "Pula", "Messina", "Palermo", "Taranto", "Valletta", "Izmayil", "Dobrich", "Prešov", "Białystok", "Košice",
    # the desert war and the Levant
    "Tripoli", "Misratah", "Surt", "Ajdabiya", "Banghazi", "Darnah", "Tubruq", "Marsa Matruh", "Alexandria",
    "Cairo", "Suez", "Bur Said", "Tunis", "Bizerte", "Sfax", "Algiers", "Oran", "Casablanca", "Tétouan",
    "Jerusalem", "Haifa", "Amman", "Beirut", "Damascus", "Aleppo", "Baghdad", "Basra", "Mosul", "Kirkuk",
    "Abadan", "Tehran", "Kuwait City", "Gibraltar",
    # every capital of 1939
    "Berlin", "Warsaw", "Paris", "London", "Moscow", "Rome", "Bratislava", "Budapest", "Bucharest", "Sofia",
    "Belgrade", "Athens", "Ankara", "Madrid", "Lisbon", "Dublin", "Brussels", "Amsterdam", "Bern", "Copenhagen",
    "Oslo", "Stockholm", "Helsinki", "Kaunas", "Vienna", "Prague",
]

# Places the war turned on that Natural Earth's list of towns does not carry: (lon, lat), from any gazetteer.
EXTRA_PLACES = {
    "Scapa Flow": (-3.10, 58.90), "Izmayil": (28.84, 45.35), "Dobrich": (27.83, 43.57), "Prešov": (21.24, 49.00),
    "Białystok": (23.16, 53.13), "Tétouan": (-5.37, 35.57), "Košice": (21.26, 48.72), "Palermo": (13.36, 38.12), "Cádiz": (-6.29, 36.53), "Misratah": (15.09, 32.38), "Petsamo": (31.20, 69.55), "Dover": (1.31, 51.13), "Calais": (1.86, 50.95),
    "Cherbourg": (-1.62, 49.64), "Narvik": (17.43, 68.44), "Kirkenes": (30.05, 69.73), "Kiruna": (20.23, 67.86),
    "Vyborg": (28.75, 60.71), "Gibraltar": (-5.35, 36.14), "Valletta": (14.51, 35.90), "Rodos": (28.22, 36.44),
    "Iraklio": (25.13, 35.34), "Tubruq": (23.96, 32.08), "Darnah": (22.64, 32.76), "Ajdabiya": (20.22, 30.76),
    "Surt": (16.59, 31.21), "Marsa Matruh": (27.24, 31.35), "Bizerte": (9.87, 37.27), "Abadan": (48.30, 30.34),
    "Kerch": (36.47, 45.36), "Maykop": (40.10, 44.61), "Pula": (13.85, 44.87), "Luxembourg": (6.13, 49.61),
    "Saarbrücken": (6.99, 49.24), "Aachen": (6.08, 50.78), "Metz": (6.18, 49.12), "Messina": (15.55, 38.19),
    "Taranto": (17.23, 40.47), "Kristiansand": (8.00, 58.15), "Tromsø": (18.96, 69.65), "Trondheim": (10.40, 63.43),
    "Haifa": (34.99, 32.82), "Kirkuk": (44.39, 35.47), "Suez": (32.55, 29.97), "Sevastopol": (33.52, 44.62),
    "Novorossiysk": (37.77, 44.72), "Grozny": (45.70, 43.32), "Gdynia": (18.53, 54.52), "Gliwice": (18.67, 50.29),
    "Edirne": (26.56, 41.68), "Constanța": (28.63, 44.18), "Ploiești": (26.02, 44.94), "Chernivtsi": (25.94, 48.29),
    "Caen": (-0.37, 49.18), "Portsmouth": (-1.09, 50.80), "Plymouth": (-4.14, 50.37), "Liège": (5.57, 50.63),
    "Tangier": (-5.80, 35.77), "Sfax": (10.76, 34.74), "Klaipėda": (21.13, 55.71), "Smolensk": (32.05, 54.78),
    "Tula": (37.62, 54.19), "Kursk": (36.19, 51.73), "Strasbourg": (7.75, 48.58), "Lille": (3.06, 50.63),
    "Bur Said": (32.30, 31.26), "Tirana": (19.82, 41.33), "Trieste": (13.77, 45.65), "Amman": (35.93, 31.95),
    "Kuwait City": (47.98, 29.37), "Bergen": (5.32, 60.39), "Katowice": (19.02, 50.26), "Bydgoszcz": (18.00, 53.12),
}

# A town is asked for by name and, where two share one, by the state of today it lies in.
FORCED_IN = {"Brest": ["BLR", "FRA"], "Tripoli": ["LBY"], "Alexandria": ["EGY"], "Rostov": ["RUS"], "Moscow": ["RUS"],
             "Paris": ["FRA"], "London": ["GBR"], "Rome": ["ITA"], "Athens": ["GRC"], "Dublin": ["IRL"], "Warsaw": ["POL"],
             "Berlin": ["DEU"], "Vienna": ["AUT"], "Madrid": ["ESP"], "Lisbon": ["PRT"]}

# ----------------------------------------------------------------------------------------
# 4. Names. Natural Earth's name of today -> the name an English newspaper of 1939 printed.
#    Checked by the historiker; where two forms were current the commoner one is taken.
#    "Name|A3" names one town where two share a name (Brest in Brittany, Brest on the Bug).
# ----------------------------------------------------------------------------------------

NAMES_1939 = {
    # Germany and what it held
    "Gdańsk": "Danzig", "Kaliningrad": "Königsberg", "Wrocław": "Breslau", "Szczecin": "Stettin",
    "Olsztyn": "Allenstein", "Elbląg": "Elbing", "Koszalin": "Köslin", "Słupsk": "Stolp", "Opole": "Oppeln",
    "Gliwice": "Gleiwitz", "Legnica": "Liegnitz", "Wałbrzych": "Waldenburg", "Zielona Góra": "Grünberg",
    "Gorzów Wielkopolski": "Landsberg", "Klaipėda": "Memel", "Sovetsk": "Tilsit", "Chernyakhovsk": "Insterburg",
    "Ełk": "Lyck", "Jelenia Góra": "Hirschberg", "Kołobrzeg": "Kolberg", "Stargard Szczeciński": "Stargard",
    "Nürnberg": "Nuremberg", "Hannover": "Hanover", "Braunschweig": "Brunswick", "Koblenz": "Coblenz",
    "München": "Munich", "Köln": "Cologne", "Wien": "Vienna",
    "Brno": "Brünn", "Plzeň": "Pilsen", "Pizen": "Pilsen", "Ostrava": "Moravská Ostrava", "Liberec": "Reichenberg",
    "Olomouc": "Olmütz", "České Budějovice": "Budweis", "Ústí nad Labem": "Aussig", "Karlovy Vary": "Karlsbad",
    "Praha": "Prague",
    # Poland
    "Warszawa": "Warsaw", "Kraków": "Cracow", "Łódź": "Lodz", "Poznań": "Poznan", "Lviv": "Lwów",
    "Vilnius": "Wilno", "Brest|BLR": "Brest-Litovsk", "Hrodna": "Grodno", "Baranavichy": "Baranowicze",
    "Rivne": "Równe", "Lutsk": "Luck", "Ternopil": "Tarnopol", "Ivano-Frankivsk": "Stanislawów",
    "Białystok": "Bialystok", "Częstochowa": "Czestochowa", "Toruń": "Torun", "Rzeszów": "Rzeszów",
    "Przemyśl": "Przemysl", "Pinsk": "Pinsk", "Navahrudak": "Nowogródek", "Lida": "Lida", "Kovel": "Kowel",
    "Drohobych": "Drohobycz",
    # the Soviet Union
    "St.  Petersburg": "Leningrad", "St. Petersburg": "Leningrad", "Volgograd": "Stalingrad",
    "Nizhny Novgorod": "Gorky", "Samara": "Kuibyshev", "Yekaterinburg": "Sverdlovsk", "Tver": "Kalinin",
    "Donetsk": "Stalino", "Luhansk": "Voroshilovgrad", "Dnipro": "Dnepropetrovsk", "Vladikavkaz": "Ordzhonikidze",
    "Stavropol": "Voroshilovsk", "Orenburg": "Chkalov", "Kyiv": "Kiev", "Kharkiv": "Kharkov",
    "Chernihiv": "Chernigov", "Mykolayiv": "Nikolayev", "Kirovohrad": "Kirovograd", "Vinnytsya": "Vinnitsa",
    "Zaporizhzhya": "Zaporozhye", "Kryvyy Rih": "Krivoy Rog", "Homyel": "Gomel", "Mahilyow": "Mogilev",
    "Vitsyebsk": "Vitebsk", "Babruysk": "Bobruisk", "Archangel": "Archangel", "Ganca": "Kirovabad",
    "Tbilisi": "Tiflis", "Yerevan": "Erivan", "Aqtobe": "Aktyubinsk", "Atyrau": "Guryev", "Oral": "Uralsk",
    "Ashgabat": "Ashkhabad", "Türkmenbaşy": "Krasnovodsk", "Vyborg": "Viipuri", "Petsamo": "Petsamo",
    "Pechenga": "Petsamo", "Sortavala": "Sortavala", "Priozersk": "Käkisalmi", "Maykop": "Maikop",
    "Mariupol": "Mariupol", "Khmelnytskyy": "Proskurov", "Zhytomyr": "Zhitomir", "Cherkasy": "Cherkassy",
    "Syktyvkar": "Syktyvkar", "Izhevsk": "Izhevsk", "Ulyanovsk": "Ulyanovsk", "Kirov": "Kirov",
    "Nal'chik": "Nalchik", "Makhachkala": "Makhachkala", "Urgentch": "Urgench", "Nukus": "Nukus",
    "Velikiy Novgorod": "Novgorod", "Elista": "Elista", "Rostov": "Rostov-on-Don",
    # the Baltic states and Finland
    "Tallinn": "Tallinn", "Kaunas": "Kaunas", "Helsinki": "Helsinki", "Turku": "Turku", "Daugavpils": "Daugavpils",
    "Liepaja": "Libau", "Liepāja": "Libau",
    # the Danube and the Balkans
    "Bratislava": "Bratislava", "Košice": "Kassa", "Uzhgorod": "Ungvár", "Chișinău": "Kishinev",
    "Chernivtsi": "Cernauti", "Ploiești": "Ploesti", "Constanța": "Constanza", "Iași": "Jassy",
    "Cluj-Napoca": "Cluj", "Timișoara": "Timisoara", "Brașov": "Brasov", "Galați": "Galatz",
    "Bilhorod-Dnistrovskyy": "Cetatea Alba", "Izmayil": "Ismail", "Bălți": "Balti", "Dobrich": "Bazargic",
    "Thessaloniki": "Salonika", "Iraklio": "Candia", "Patra": "Patras", "Larisa": "Larissa", "Ioannina": "Yannina",
    "Rodos": "Rhodes", "Kerkira": "Corfu", "Skopje": "Skoplje", "Niš": "Nish", "Rijeka": "Susak",
    "Pula": "Pola", "Zadar": "Zara", "Durrës": "Durazzo", "Vlorë": "Valona", "Shkodër": "Scutari",
    "Podgorica": "Podgorica", "Bitola": "Bitolj", "Ruse": "Ruse", "Edirne": "Adrianople",
    "İzmir": "Smyrna", "İskenderun": "Alexandretta", "Trabzon": "Trebizond", "Erzurum": "Erzerum",
    "Diyarbakır": "Diyarbekir", "Gaziantep": "Aintab", "Eskişehir": "Eskishehir", "Kahramanmaraş": "Marash",
    "Şanlıurfa": "Urfa", "Elâzığ": "Elazig", "Antalya": "Adalia", "Istanbul": "Istanbul", "Ankara": "Ankara",
    # the west and the north
    "København": "Copenhagen", "Århus": "Aarhus", "Göteborg": "Gothenburg", "Antwerpen": "Antwerp",
    "Gent": "Ghent", "Brugge": "Bruges", "The Hague": "The Hague", "Lisboa": "Lisbon", "Sevilla": "Seville",
    "La Coruña": "Corunna", "Genova": "Genoa", "Torino": "Turin", "Milano": "Milan", "Napoli": "Naples",
    "Firenze": "Florence", "Venezia": "Venice", "Roma": "Rome", "Reggio di Calabria": "Reggio",
    # Africa and the Levant
    "Banghazi": "Benghazi", "Tubruq": "Tobruk", "Darnah": "Derna", "Misratah": "Misurata", "Surt": "Sirte",
    "Ajdabiya": "Agedabia", "Marsa Matruh": "Mersa Matruh", "Bur Said": "Port Said", "Annaba": "Bône",
    "Béchar": "Colomb-Béchar", "Skikda": "Philippeville", "Tétouan": "Tetuan", "Marrakesh": "Marrakesh",
    "Kuwait City": "Kuwait", "Dayr az Zawr": "Deir ez-Zor", "Ṭarābulus": "Tripoli (Lebanon)",
    "Tehran": "Teheran", "Mashhad": "Meshed", "Rasht": "Resht", "Bandar-e-Abbas": "Bandar Abbas",
    "Bandar-e Bushehr": "Bushire", "Ahvaz": "Ahwaz", "Kermanshah": "Kermanshah", "Irbil": "Erbil",
    "As Sulaymaniyah": "Sulaimaniya", "An Nasiriyah": "Nasiriya", "Al Hillah": "Hilla",
    "Sabha": "Sebha", "Ghadamis": "Ghadames", "Sabhā": "Sebha", "Al Jawf": "Kufra",
}

# Capitals of states too small for this map: never a region's town.
NOT_A_TOWN = {"MCO", "SMR", "VAT", "LIE", "AND", "IMN"}
# Towns on small islands that would otherwise each make a region of their own.
NOT_SEEDS = {"Lerwick", "Douglas"}

# Names put right after the historiker's pre-check (docs/pruefer/historiker_vorpruefung_1939.md, table 7), and
# towns Natural Earth lists that did not exist or bore another name in 1939. "Name@lat" names one of two
# towns of one name in one state by its latitude, rounded.
NAMES_FIXED = {
    "Rostov@47": "Rostov-on-Don", "Sevastopol": "Sebastopol", "Liepaga": "Liepaja", "Liepaja": "Liepaja",
    "Liepāja": "Liepaja", "Brno": "Brno", "Olomouc": "Olomouc", "Ioanina": "Janina", "Ioannina": "Janina",
    "Korçë": "Koritza", "Korce": "Koritza", "Sarandë": "Porto Edda", "Sarande": "Porto Edda",
    "Bajram Curri": "Kukes", "Kukës": "Kukes", "Maladzyechna": "Molodeczno", "Nizhyn": "Nezhin",
    "Mazyr": "Mozyr", "Dubasari": "Dubossary", "Kingston upon Hull": "Hull", "Londonderry/Derry": "Londonderry",
    "Zadar": "Sibenik",          # DEVIATION: Zara itself was an Italian enclave; the region round it was Yugoslav
    "Mykolayiv": "Nikolaev", "Zaporizhzhya": "Zaporozhe", "Batumi": "Batum", "Nizhny Novgorod": "Gorki",
    "Karlovy Vary": "Carlsbad", "Livorno": "Leghorn", "Bizerte": "Bizerta", "Baghdad": "Bagdad",
    "Chernivtsi": "Cernauti", "Bilhorod-Dnistrovskyy": "Akkerman", "Ivano-Frankivsk": "Stanislawow",
    "Lviv": "Lwow", "Rivne": "Rowne", "Navahrudak": "Nowogrodek",
    # founded or named after 1939: the older place nearest to it
    "Nizhnekamsk": "Yelabuga", "Volgodonsk": "Tsimlyanskaya", "Balkanabat": "Nebit-Dag", "Pechora": "Ust-Usa",
    "Mangyshlak": "Fort Shevchenko", "Er Rachidia": "Ksar-es-Souk", "Illizi": "Fort Polignac", "Sefra": "Ain Sefra",
    "Arar": "Jauf", "Zhangaozen": "Fort Shevchenko", "Severouralsk": "Serov", "Zhetiqara": "Dzhetygara",
    "Slantsy": "Kingisepp", "Beyneu": "Ust-Urt", "Zaranj": "Chakhansur", "An Nabk": "Kaf", "Dubăsari": "Dubossary",
    "Al Aqabah": "Akaba", "Ar Rutbah": "Rutba", "Al Hasakah": "Hassetche", "Alexandroupoli": "Alexandroupolis",
    "Ermoupoli": "Syra", "Mitilini": "Mytilene", "Kavala": "Kavalla", "Uşak": "Ushak", "Usak": "Ushak", "Zillah": "Zella",
    "Izmayil": "Ismail", "Dobrich": "Bazargic", "Prešov": "Presov", "Tétouan": "Tetuan", "Białystok": "Bialystok",
    # Ust-Urt, Chakhansur and Kaf are filled in, not attested as towns of 1939: the land's own name stands for a seat. "Miercurea Cuic": "Miercurea Ciuc", "Aral": "Aralsk", "Oktyabrsk": "Syzran",
}

# The one region of a state

# The one region of a state the window shows a corner of, where Natural Earth lists no town there.
FALLBACK_NAMES = {"AFG": "Chakhansur", "LUX": "Luxembourg", "ITA/SVN": "Postumia", "ITA/HRV": "Pola", "ENG/PAK": "Chagai",
                  "GER/LTU": "Memel", "POL/LTU": "Wilno", "HUN/SVK": "Kassa", "FIN/RUS": "Viipuri"}
