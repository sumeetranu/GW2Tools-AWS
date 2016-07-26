// var myApp = angular.module('myApp', ['ngTable', 'ngRoute']);
var myApp = angular.module('myApp', ['ngTable']);

myApp.controller('AppCtrl', ['$scope', '$http', '$timeout', 'NgTableParams', '$q', Controller]);
/*myApp.config(function($routeProvider) {
	$routeProvider
			.when('/', {
					templateUrl:'controllers/home.html',
					controller:'homeController'
			})	

			.when('/achievements', {
					templateUrl:'controllers/achievements.html',
					controller:'achievementsController'
			})

			.when('/about', {
					templateUrl:'controllers/about.html',
					controller:'aboutController'
			});
});*/

myApp.controller('controller', ['$scope', '$http', '$timeout', 'NgTableParams', '$q', Controller]);

/*myApp.controller('achievementsController', ['$scope', AchievementsController]);

myApp.controller('aboutController', ['$scope', AboutController]);

function AchievementsController($scope){
		$scope.message = 'This is the achievements controller';
}

function AboutController($scope){
		$scope.message = 'This is the about controller';

}*/

function Controller($scope, $http, $timeout, NgTableParams, $q) {  
	$scope.message = 'This is the home controller';

	var accessToken = ""; 

	$scope.authenticate = function(token) {
		accessToken = token;
		$scope.loggedOut = false;
		loadData();
	}

    $scope.achievementInfo = [];
    $scope.basicInfo = {};
    $scope.tableParams = new NgTableParams({}, { dataset: $scope.achievementInfo});

    $scope.loginSuccess=true;

    $scope.loginPage=false;

    $scope.getName = getName;
    $scope.getPercentage = getPercentage;

    $scope.loadingData = false;

    //$scope.achievements = {};

    $scope.getDescription = getDescription;

    $scope.logout = function() {
    	accessToken = "";
    	getInfo();
    	$scope.loggedOut = true;
    }

    $scope.loggedOut = false;

    $scope.login = function () {
    	console.log('Logging in');
    	$scope.loginPage=true;
    }

    var loadData = function() {
    	console.log('Load data');
    	$scope.loadingData = true;
    	
    	if($scope.achievements == undefined){
    		console.log('No achievements found');
			$scope.loadingData = true;
			getNames();
		} else{
			console.log('Achievements found:', $scope.achievements);
			$scope.loadingData = false;
			getInfo();
		}

    }

	var getInfo = function(){
		console.log("Getting info");
		$scope.achievementInfo = [];
    	$scope.basicInfo = {};
    	$scope.tableParams = new NgTableParams({}, { dataset: $scope.achievementInfo});

		// Basic account info
		var accountUrl = 'https://api.guildwars2.com//v2/account?access_token=' + accessToken;
		$http.get(accountUrl, {cache:true}).success(function(response) {
			console.log('Got basic info');
			$scope.basicInfo = response;
			$scope.loginSuccess=true;
		}).error(function(response) {
			console.log('Failed login due to:', response);
			$scope.loginSuccess=false;
			$scope.basicInfo={};
		});

		// Account info and completion
		var achievementsUrl = 'https://api.guildwars2.com//v2/account/achievements?access_token=' + accessToken;
		$http.get(achievementsUrl, {cache:true}).success(function(response) {
			console.log('Got achievement info');
			$scope.loginSuccess=true;
			$scope.achievementInfo = response.sort(function(a,b){
				var valA = (a.current*100)/a.max;
				var valB = (b.current*100)/b.max;
				return valB-valA;
			});	

			$scope.tableParams = new NgTableParams({}, { dataset: transform($scope.achievementInfo)});

		}).error(function(response) {
			console.log('Failed login due to:', response);
			$scope.loginSuccess=false;
		});	

		console.log($scope.achievements);
	}
	
   	function getDescription(achievement){
   		var description = $scope.achievements[achievement.id].description;
   		var requirement = $scope.achievements[achievement.id].requirement;

   		var ret = description.replace('<c=@flavor>','') + ' ' + requirement.replace('<c=@flavor>','');
   		console.log('calling getDescription:', ret);

   		return ret;
   	}

    function transform(data){
    	ret = [];
    	for(var i=0; i<data.length; i++){
    		if(data[i].done==false){
    			var curData = data[i];
    			var curRet = {
	    			name: $scope.getName(curData.id),
	    			totalCompletion: curData.current + ' / ' + curData.max,
	    			totalPercentage: getPercentage(curData),
	    			tierCompletion: curData.current/curData.max,
	    			tierPercentage: getPercentage(curData),
	    			description: getDescription($scope.achievements[curData.id])
    			};
    			ret.push(curRet);
    		}
    	}
    	return ret;
    }

	function getPercentage(achievement) {
		var percent=(achievement.current*1.0)/achievement.max*100;
		var rounded = percent.toFixed(2)
		return rounded;
	}

	$scope.loadingPercentage = 0;

	function getNames() {
		console.log('Getting names');
		$scope.achievements = [];
		var numAchievements = 0;
		var arr = [];
		// Get total number
		var achievementUrl = 'https://api.guildwars2.com/v2/achievements';
		var baseUrl = achievementUrl + '/'
		$http.get(achievementUrl, {cache:true}).then(function(response) {
			numAchievements = response.data.length;

			for(var i=0; i<numAchievements; i++){
				var newUrl = baseUrl + response.data[i];
				arr.push($http.get(newUrl, {cache:true}));
			}

			$q.all(arr).then(function(ret) {
				for(var j=0; j<ret.length; j++){
					var data = ret[j].data;
					$scope.achievements[data.id] = data;
					if(j==ret.length-1){
						console.log('Calling getInfo');
						getInfo();
						$scope.basicInfo = {name:'Loading'};
						$scope.loadingData=false;
					}
				}
			});
		});

		// Loop each and create promise

		// q.all and then stop loading bar (this func is before getInfo)
	}


	function getName(id) {
		return $scope.achievements[id].name;
		//return $scope.names[id];
		/*var achievementUrl = 'https://api.guildwars2.com//v2/achievements?id=' + id;
		$http.get(achievementUrl).then(function(response) {
			return response.data.name;
		});*/

	}
	
	// Id to name mapping hardcoded for now
	$scope.names = {
	   "1":"Centaur Slayer",
	   "2":"Teamwork Gets It Done",
	   "3":"Skritt Slayer",
	   "4":"Harpy Slayer",
	   "5":"Drake Slayer",
	   "6":"Spider Slayer",
	   "7":"Indiscriminate Slayer",
	   "8":"Bandit Slayer",
	   "9":"Emergency Response Hero",
	   "10":"Gold Hoarder",
	   "11":"Skillful",
	   "12":"Krytan Explorer",
	   "13":"Thirst Slayer",
	   "14":"All You Can Eat",
	   "15":"Tinkerer",
	   "16":"Skale Slayer",
	   "17":"Staff Master",
	   "18":"Sword Master",
	   "19":"Dagger Master",
	   "20":"Longbow Master",
	   "21":"Axe Master",
	   "22":"Scepter Master",
	   "23":"Bat Slayer",
	   "24":"Shell Slayer",
	   "25":"Devourer Slayer",
	   "26":"Dredge Slayer",
	   "27":"Elemental Slayer",
	   "28":"Ettin Slayer",
	   "29":"Ghost Buster",
	   "30":"Fish Slayer",
	   "31":"Giant Slayer",
	   "32":"Griffon Slayer",
	   "33":"Grawl Slayer",
	   "34":"Hylek Slayer",
	   "35":"Flame Legion's Bane",
	   "36":"Imp Slayer",
	   "37":"Inquest's Bane",
	   "38":"Insect Slayer",
	   "39":"Jotun Slayer",
	   "40":"Krait Slayer",
	   "41":"Minotaur Slayer",
	   "42":"Nightmare Court's Bane",
	   "43":"Ogre Slayer",
	   "44":"Ooze Slayer",
	   "45":"Pirate Slayer",
	   "46":"Plant Slayer",
	   "47":"Raptor Slayer",
	   "48":"Skelk Slayer",
	   "49":"Sons of Svanir's Bane",
	   "50":"Troll Slayer",
	   "51":"Wind Rider Slayer",
	   "52":"Wurm Slayer",
	   "53":"Zhaitan's Bane",
	   "54":"Short-Bow Master",
	   "55":"Mace Master",
	   "56":"Focus Master",
	   "57":"Greatsword Master",
	   "58":"Hammer Master",
	   "65":"Graduation Day",
	   "68":"Waking from the Nightmare",
	   "69":"A Season of Growth",
	   "78":"Branching Out",
	   "79":"Some Must Fight, That All May Be Free",
	   "80":"A Friend In Deed",
	   "81":"This Far, No Further",
	   "86":"Artificer",
	   "87":"Chef",
	   "89":"Jeweler",
	   "100":"Shiverpeak Explorer",
	   "101":"Ascalon Explorer",
	   "102":"Maguuma Explorer",
	   "103":"Orr Explorer",
	   "106":"Speargun Master",
	   "107":"Trident Master",
	   "108":"Harpoon Master",
	   "121":"Dungeons Discovered",
	   "122":"Dungeon Master",
	   "123":"Hobby Dungeon Explorer",
	   "127":"Salvage Master",
	   "128":"Combat Mechanic",
	   "129":"Agent of Entropy",
	   "133":"Active Guild Member",
	   "134":"Local Hero",
	   "136":"No One Left Behind",
	   "137":"Been There, Done That",
	   "138":"Master Crafter",
	   "139":"Lifetime Survivor",
	   "140":"Hunter Gatherer",
	   "142":"Shaman's Rookery",
	   "143":"Wall Breach Blitz",
	   "144":"Demongrub Pits",
	   "147":"Grendich Gamble",
	   "148":"King Jalis's Refuge",
	   "149":"Loreclaw Expanse",
	   "151":"The Collapsed Observatory",
	   "152":"Hint Completion",
	   "153":"Master of Overkill",
	   "154":"Crimson Plateau",
	   "155":"Goemm's Lab",
	   "156":"Behem Gauntlet",
	   "157":"Craze's Folly",
	   "158":"Buried Archives",
	   "160":"Spelunker's Delve",
	   "161":"Morgan's Leap",
	   "163":"Conundrum Cubed",
	   "164":"Kegs Scored",
	   "165":"Keg Brawl Wins",
	   "166":"Keg Interceptions",
	   "168":"Keg Fumbles Caused",
	   "171":"Keg Steals",
	   "172":"Dark Reverie",
	   "185":"Manor Magnate",
	   "186":"Catacombs Conqueror",
	   "187":"Master of Arah",
	   "188":"Sorrow's Subjugator",
	   "189":"Twilight's Idol",
	   "190":"Sanctuary Savior",
	   "191":"Citadel of Flame Foe",
	   "192":"Eternity's Epitome",
	   "194":"Shattered Ice Ruins",
	   "195":"Tribulation Rift Scaffolding",
	   "201":"Pig Iron Quarry",
	   "202":"Vizier's Tower",
	   "205":"Chaos Crystal Cavern",
	   "206":"Antre of Adjournment",
	   "207":"Only Zuhl",
	   "217":"Weyandt's Revenge",
	   "218":"Urmaug's Secret",
	   "220":"Crash Landing",
	   "221":"Cleaning Up the Neighborhood",
	   "222":"Speedy Reader",
	   "239":"Slayer",
	   "240":"Professional Assassin",
	   "241":"Conqueror",
	   "247":"Gladiator",
	   "248":"Mercenary",
	   "249":"Avenger",
	   "250":"Ransacker",
	   "251":"Marauder",
	   "252":"Ravager",
	   "265":"Champion Brawler",
	   "269":"Paragon",
	   "271":"Phantom",
	   "272":"Hunter",
	   "277":"Champion Paragon",
	   "279":"Champion Phantom",
	   "280":"Champion Hunter",
	   "283":"Realm Avenger",
	   "284":"Realm Defender",
	   "285":"A Pack Dolyak's Best Friend",
	   "288":"Yakslapper",
	   "291":"Going Camping",
	   "297":"It's Quite Roomy in Here",
	   "300":"All We See, We Own",
	   "303":"Take Everything in Sight",
	   "306":"Repair Master",
	   "307":"Master of Disaster",
	   "316":"Nice View From Up Here",
	   "319":"Stay Out!",
	   "322":"Stopped Them Cold",
	   "335":"Dive Master",
	   "336":"King of the Costume Brawl",
	   "337":"Dispelling Shadows",
	   "338":"Don't Feed the Beast",
	   "339":"Cleanup Crew",
	   "340":"Shattered",
	   "341":"Svanir's Bane",
	   "342":"That Had to Burn",
	   "343":"Kill the Hydra Queen",
	   "344":"Forsaken Fortune",
	   "345":"Vexa's Lab",
	   "346":"Tears of Itlaocol",
	   "347":"Don't Touch the Shiny",
	   "348":"Magellan's Memento",
	   "349":"Windy Cave Treasure",
	   "350":"Ship of Sorrows",
	   "352":"Beaker's Empty Belly",
	   "354":"Grounded",
	   "355":"Goff's Loot",
	   "357":"Bad Neighborhood",
	   "366":"Hexfoundry Unhinged",
	   "367":"Hidden Garden",
	   "368":"Coddler's Cove",
	   "369":"Tribulation Caverns",
	   "372":"A Waddle to Remember",
	   "373":"Chicken Scramble",
	   "381":"Volcanic Fractal Stabilizer",
	   "382":"Fractal Frequenter",
	   "383":"Underground Facility Fractal Stabilizer",
	   "384":"Solid Ocean Fractal Stabilizer",
	   "385":"Swampland Fractal Stabilizer",
	   "386":"Cliffside Fractal Stabilizer",
	   "387":"Uncategorized Fractal Stabilizer",
	   "388":"Snowblind Fractal Stabilizer",
	   "389":"Aquatic Ruins Fractal Stabilizer",
	   "390":"Urban Battleground Fractal Stabilizer",
	   "391":"The Floor Is Lava. Don't Step In It.",
	   "392":"Carrier Cacophony",
	   "394":"Fancy Footwork",
	   "395":"Take a Bow",
	   "396":"Hop, Skip, and Jump",
	   "397":"If We Only Had Marshmallows",
	   "399":"Out of Cluck",
	   "400":"Skipping Stones",
	   "401":"Under New Management",
	   "546":"Scholar",
	   "547":"Minor in Enhancement",
	   "548":"Bachelor of Pioneering",
	   "549":"Minor in Immortality",
	   "550":"Minor in Fortitude",
	   "551":"Minor in Excavation",
	   "552":"Associate of Secrets, World 1",
	   "553":"Bachelor of Secrets, World 1",
	   "554":"Master of Secrets, World 1",
	   "555":"Doctor of Secrets, World 1",
	   "556":"Associate of Baubles, World 1",
	   "559":"Doctor of Baubles, World 1",
	   "560":"Minor in Elusion",
	   "562":"Baby's First Super Adventure",
	   "648":"Not So Secret",
	   "687":"History Buff",
	   "690":"Master of Heroics",
	   "752":"Southsun Survival Regular",
	   "753":"Keg Brawl Regular",
	   "755":"Crabgrabber",
	   "756":"Crab-Carrying Competitor",
	   "757":"Crab Toss Regular",
	   "758":"Survival Survivor",
	   "759":"Southsun Trapper",
	   "760":"Ruthless Survivor",
	   "761":"Resourceful Survivor",
	   "763":"Skilled Sprinter",
	   "764":"Crystal Obsessed",
	   "857":"Baby's Second Super Adventure",
	   "863":"Minor in Achievement",
	   "900":"Slaughter in the Swamp",
	   "901":"Power Play",
	   "902":"Quick on Your Feet",
	   "903":"I Found It!",
	   "904":"Above the Waves",
	   "905":"Burning Light",
	   "906":"Flawless Defense",
	   "907":"Watch Your Step!",
	   "908":"Have a Seat and Pull the Trigger",
	   "909":"Tail Flail",
	   "910":"Tequatl the Sunless",
	   "916":"Cleaned Your Clockheart",
	   "917":"Lionguard Justice",
	   "918":"Fire and Oil",
	   "919":"What Does She Know?",
	   "920":"Not in Charge Anymore",
	   "921":"Unshippable",
	   "922":"Hold It Right There",
	   "923":"Hack Attack",
	   "924":"Greasing the Gears",
	   "925":"Pirate Booty",
	   "926":"Above and Beyond",
	   "927":"Twilight Assaulter",
	   "928":"Stay Cool",
	   "929":"Who's in Charge Here?",
	   "930":"Grounded",
	   "932":"Broken Clockwork",
	   "933":"True Friend to Turma",
	   "934":"Secrets in the Forest",
	   "1189":"Holo-Hornpipe",
	   "1190":"Subject 6 Deep-Sixer",
	   "1192":"Shockwave Skipper",
	   "1193":"Weapons Tester",
	   "1194":"Thaumanova Reactor Fractal Stabilizer",
	   "1195":"Aetherblade Retreat Stabilizer",
	   "1196":"Molten Furnace Fractal Stabilizer",
	   "1197":"Aetherblade Captain Stabilizer",
	   "1198":"Molten Boss Fractal Stabilizer",
	   "1332":"Wurm Phytotoxin Collector",
	   "1333":"Phytotoxin Enthusiast",
	   "1334":"Wurmslayer",
	   "1335":"Wurm Barf",
	   "1336":"Wurm Hurdler",
	   "1337":"Wurm Kleptomaniac",
	   "1338":"Wurm Bait",
	   "1339":"Wurm Demolitionist",
	   "1340":"Wurm Egg Scrambler",
	   "1341":"Wurm Decapitator",
	   "1342":"Triple Trouble",
	   "1368":"Resourceful",
	   "1369":"Some Say It's Your Specialty",
	   "1371":"Make It Rain",
	   "1373":"Ledge of the Mists",
	   "1380":"Wurmhole Traveler",
	   "1381":"Nice Ride",
	   "1382":"Blades in the Mists",
	   "1459":"Wurmicidal Maniac",
	   "1567":"Fashion Forward",
	   "1669":"Bottoms Up",
	   "1670":"Toxicity Trampler",
	   "1675":"Mordrem Problems",
	   "1676":"Boomyaks",
	   "1679":"Finish What You Started",
	   "1681":"Birthday—Year 1",
	   "1709":"Miniature Collection—Set I",
	   "1710":"Brewmaster",
	   "1711":"Treasure Hunter",
	   "1714":"Citadel of Flame Collector",
	   "1715":"Style Guide",
	   "1717":"Hylek Historian",
	   "1718":"Honor of the Waves Collector",
	   "1719":"Crucible of Eternity Collector",
	   "1720":"Uncanny Canner",
	   "1721":"Twilight Arbor Collector",
	   "1722":"Sorrow's Embrace Collector",
	   "1723":"Caudecus's Manor Collector",
	   "1724":"The Ruined City of Arah Collector",
	   "1725":"Ascalonian Catacombs Collector",
	   "1726":"Krait Antiquarianism Study",
	   "1727":"Fine Dining",
	   "1728":"Fine Wining",
	   "1729":"Utility Utilizer",
	   "1730":"Trash Collector",
	   "1731":"Exotic Attire",
	   "1734":"Ascended Accoutrement",
	   "1745":"Grawl Archaeological Study",
	   "1748":"Exotic Hunter",
	   "1750":"Alpha Crafter",
	   "1751":"Rare Regalia",
	   "1753":"Dungeoneer",
	   "1754":"Koutalophile",
	   "1765":"Something Good to Eat",
	   "1778":"Bloody Prince's Toybox",
	   "1779":"Luminescent Footwear",
	   "1781":"Luminescent Shoulderguard",
	   "1797":"Iron",
	   "1798":"Copper",
	   "1799":"The Demolisher",
	   "1800":"Platinum",
	   "1801":"The Executioner",
	   "1802":"The Annihilator",
	   "1803":"The Tormentor",
	   "1804":"The Be-All and the End-All",
	   "1805":"Mercantile Mercenary",
	   "1806":"Silver and Gold",
	   "1807":"Silverwastes Shoveler",
	   "1808":"Defender: Indigo Cave",
	   "1809":"Defender: Blue Oasis",
	   "1810":"Lost Badges",
	   "1811":"Defender: Red Rock Bastion",
	   "1812":"Defender: Amber Sandfall",
	   "1814":"Luminescent Gloves",
	   "1824":"Fear No Evil",
	   "1825":"Luminescent Leggings",
	   "1835":"Go for the Gold",
	   "1836":"Ambassador's Aid",
	   "2029":"Wintersday Toy Weapons Collection",
	   "2030":"For the Children!",
	   "2032":"Snowball Mayhem Participant",
	   "2033":"Wintersday Wrecking Ball",
	   "2034":"Honorary Krewe Member",
	   "2035":"Golden Generosity",
	   "2036":"Donation Defender",
	   "2037":"Wrapping Everywhere",
	   "2039":"Dolyak Defender",
	   "2040":"Finders Keepers",
	   "2041":"Toy Quality Control",
	   "2042":"Ringing the Right Notes",
	   "2043":"Toypocalypse Survivor",
	   "2044":"Adept Toymaker",
	   "2045":"The Bells of Wintersday",
	   "2046":"Silver for the Season",
	   "2047":"Nothing but Broken Toys",
	   "2048":"Generous Harvest",
	   "2049":"Grawnk Munch",
	   "2051":"Luminescent Headgear",
	   "2052":"Luminescent Coat",
	   "2063":"Golem Protector",
	   "2064":"Beekeeper Crusher",
	   "2065":"Mangler Wrangler",
	   "2067":"Jump Up to Get Down",
	   "2068":"Vinewrath Vanquisher",
	   "2069":"Covered in Bees!",
	   "2070":"Don't Look Now",
	   "2071":"Arboreal Protector",
	   "2072":"Devourer Protector",
	   "2073":"Dark Wing Defoliator",
	   "2078":"Dragon's Heart",
	   "2126":"Troll's Revenge",
	   "2127":"Glutton for Guidance",
	   "2128":"Lion's Arch Exterminator",
	   "2132":"I've Seen Things",
	   "2143":"Auric Basin Insight: Lastgear Standing",
	   "2145":"Verdant Brink Insight: Thistlevine Ravine",
	   "2146":"Verdant Brink Insight: Holdfast Hollow",
	   "2147":"Verdant Brink Insight: Creaking Cavern",
	   "2148":"Verdant Brink Insight: Outside Noble Ledges",
	   "2149":"Verdant Brink Insight: Creeping Crevasse",
	   "2150":"Verdant Brink Insight: Heartless Pass",
	   "2151":"Gerent Slayer",
	   "2154":"A Stomping Good Time",
	   "2155":"Honorary Rata Novan",
	   "2156":"Master of the Molten Ore",
	   "2161":"Candy Corn Crusher",
	   "2164":"Auric Basin Insight: Southwatch Creep",
	   "2165":"Raised the Bar",
	   "2167":"New Afterlife for Quaggan",
	   "2168":"Auric Basin Insight: Masks of the Fallen",
	   "2169":"Crimson Wurmslayer",
	   "2172":"Cloak and Snagger",
	   "2181":"Revered",
	   "2185":"Rally to Maguuma",
	   "2186":"Triple Mordrem Takedown",
	   "2190":"Leystone Armor",
	   "2202":"Karka Queen Killer",
	   "2203":"Honorary Jaka Itzel",
	   "2204":"Auric Basin Insight: Jawatl Grounds",
	   "2206":"Going Berserk",
	   "2208":"Something Good to Eat",
	   "2209":"Death to the Undying",
	   "2211":"Sky Stalker",
	   "2212":"Dragon's Stand Explorer",
	   "2214":"\"Pride of Lion's Arch\" Strongbox",
	   "2216":"Hidden Amphibian",
	   "2221":"Yggdrasil",
	   "2222":"Verdant Brink Explorer",
	   "2224":"Stavemaster Adryn Slayer",
	   "2234":"Zinn's Prize Student",
	   "2236":"Hivemaster",
	   "2237":"Regurgicidal",
	   "2240":"\"Vengeance Rising\" Strongbox",
	   "2246":"Equitable Elector",
	   "2248":"Follows Advice",
	   "2249":"\"Glory of Tyria\" Strongbox",
	   "2251":"Roost Rouster",
	   "2257":"Pact Camper",
	   "2261":"Ogre Lane Defender",
	   "2264":"Torn from the Sky",
	   "2265":"Dragon's Stand Overviewer",
	   "2267":"Auric Basin Insight: Eastwatch Bluff",
	   "2269":"Central Tower Taker",
	   "2281":"Ground Pounder",
	   "2283":"The Golden Chicken",
	   "2284":"A Royal Tradition",
	   "2287":"Is A Good Offense",
	   "2293":"Nuhoch Lane Defender",
	   "2294":"Tetrad Trouncer",
	   "2299":"SCAR Supporter",
	   "2304":"Caught 'Em All",
	   "2305":"Tangled Depths Insight: Order of Whispers Outpost",
	   "2307":"Pale Reaver Believer",
	   "2310":"Rata Novus Lane Defender",
	   "2312":"Pumpkin Carving",
	   "2314":"Heart of Thorns Act I Mastery",
	   "2315":"The Jungle Provides",
	   "2323":"Ogre Airship Climber",
	   "2333":"Froglicker",
	   "2339":"Verdant Brink Insight: Fumerol Caves",
	   "2352":"Lord of the Jungle",
	   "2358":"Bonebreaker",
	   "2369":"Father of Wyverns",
	   "2370":"Auric Basin Explorer",
	   "2373":"A Study in Gold",
	   "2376":"Northern Tower Taker",
	   "2378":"Tangled Depths Explorer",
	   "2380":"Tangled Depths Insight: Terraced Hive",
	   "2386":"Crystallized Cache Seeker",
	   "2387":"Wallowing Whiz",
	   "2396":"Tangled Depths Insight: Northern Confluence",
	   "2399":"Champion Revered",
	   "2401":"Sum Viewer",
	   "2402":"Seeker of Lost Homework",
	   "2407":"Bladed Armor",
	   "2417":"Droppin' Bombs",
	   "2420":"Twilight I: The Experimental Nightsword",
	   "2423":"Mother of Wyverns",
	   "2427":"Powered Up",
	   "2429":"Diarmid Dropper",
	   "2431":"Ordnance Corps Auxiliary",
	   "2436":"Dive Master: Chak Hive",
	   "2437":"\"Whitebear's Pride II\" Strongbox",
	   "2439":"Shooting Star",
	   "2440":"Establishing a Foothold",
	   "2446":"\"Plains of Golghein\" Strongbox",
	   "2452":"Ydalir",
	   "2474":"Amber Wurmslayer",
	   "2482":"Shut the Doors",
	   "2493":"Fractal Experience",
	   "2494":"Salvage Pit: Silver",
	   "2496":"Mouth of Mordremoth Master",
	   "2499":"Salvage Pit: Gold",
	   "2505":"\"Lethal Vantage\" Strongbox",
	   "2510":"Excellent Judge of Character",
	   "2512":"\"Obsidian Triumph\" Strongbox",
	   "2514":"Adept Dragonhunter",
	   "2517":"Auric Basin Insight: Luminate's Throne",
	   "2523":"SCAR Lane Defender",
	   "2529":"Mistward Headwrap",
	   "2539":"A Sweet Friend",
	   "2541":"Patron of the Nobility",
	   "2549":"Tarnished Traitor",
	   "2552":"\"Mellaggan's Valor\" Strongbox",
	   "2553":"Mouth of Mordremoth Slayer",
	   "2554":"Champion Chak Hunter",
	   "2555":"Ultimate Challenge Winner",
	   "2563":"Wartime Sommelier",
	   "2565":"\"Endurance\" Strongbox",
	   "2566":"Sky Commander",
	   "2568":"Forgotten City Arches",
	   "2570":"The Most Dangerous Game",
	   "2573":"Bronzer",
	   "2574":"Treetop Retriever",
	   "2576":"Chak Bait",
	   "2583":"\"Slice of Sky\" Strongbox",
	   "2593":"Master Druid",
	   "2594":"Mordrem Begone",
	   "2595":"Tamer of Wyverns",
	   "2601":"Prismatic Percher",
	   "2602":"No Mask Left Behind",
	   "2605":"Bat Wrangler",
	   "2612":"Auric Basin Insight: The Falls",
	   "2613":"Honorary Ogre",
	   "2617":"\"Straight and Narrow\" Strongbox",
	   "2618":"Ba-Boom",
	   "2620":"Cobalt Wurmslayer",
	   "2622":"Saving the City of Gold",
	   "2624":"\"Thunderbreaker\" Strongbox",
	   "2625":"Friend of the Frogs",
	   "2631":"\"Faren's Flyer\" Strongbox",
	   "2634":"Tarir Challenge Winner",
	   "2636":"Grassy Troll",
	   "2638":"Adept Druid",
	   "2672":"League Rank Earner—Recruit",
	   "2677":"League Professional—Recruit",
	   "2680":"Essence Collector—Veteran",
	   "2685":"Essence Collector—Champion",
	   "2689":"Wings of Glory—Recruit",
	   "2690":"League Recruit",
	   "2698":"League Top Stats—Recruit",
	   "2707":"League Conqueror—Recruit",
	   "2709":"League Dominator—Recruit",
	   "2712":"Wings of Glory—Veteran",
	   "2715":"Path of the Ascension IV: Hymn of Glory",
	   "2718":"League Guardian—Recruit",
	   "2720":"League Veteran",
	   "2725":"Path of the Ascension III: Monument of Legends",
	   "2728":"Mystic Essence Collector—Veteran",
	   "2731":"Essence Collector—Elite",
	   "2733":"League Necromancer—Recruit",
	   "2734":"Mystic Essence Collector—Elite",
	   "2737":"Mystic Essence Collector—Recruit",
	   "2738":"Path of the Ascension I: The Thrill of Battle",
	   "2740":"Beginning \"The Ascension\" Journey",
	   "2750":"Essence Collector—Recruit",
	   "2752":"Path of the Ascension II: Tapestry of Sacrifice",
	   "2753":"Mystic Essence Collector—Champion",
	   "2758":"League Slayer—Recruit",
	   "2759":"Daily League Participator—Recruit",
	   "2765":"Festive Imbiber",
	   "2767":"Honorary Krewe Member",
	   "2769":"Toy Quality Control",
	   "2770":"Donation Defender",
	   "2771":"Dolyak Defender",
	   "2772":"Snowball Fight!",
	   "2773":"Wrapping Everywhere",
	   "2777":"Frozen Claw",
	   "2778":"Disassembly",
	   "2779":"Silver for the Season",
	   "2780":"Seasoned Toymaker",
	   "2781":"Ringing the Right Notes",
	   "2782":"Sounds of the Season",
	   "2783":"Wintersday Wrecking Ball",
	   "2784":"Golden Generosity",
	   "2788":"Toypocalypse Survivor",
	   "2790":"Snowball Mayhem Participant",
	   "2791":"Nothing but Broken Toys",
	   "2792":"Connoisseur of Confection",
	   "2793":"The Bells of Wintersday",
	   "2794":"Finders Keepers",
	   "2795":"Light Up the Sky",
	   "2796":"Branded Bane",
	   "2797":"Medic!",
	   "2798":"Shattering Setup",
	   "2799":"Crystal Healing Denier",
	   "2800":"Dragon's Heart",
	   "2801":"Burns Blunder",
	   "2802":"The Shatterer",
	   "2803":"No-Fly Zone",
	   "2804":"Dragon Ball Champion",
	   "2806":"Firecracker Finder",
	   "2807":"Shattering Evasion",
	   "2808":"Smash the Dragon",
	   "2809":"Dragon's Gaze",
	   "2810":"Lightning Reflexes",
	   "2812":"Bash the Dragon",
	   "2813":"Crystal Clear",
	   "2814":"Dragon's Shadow",
	   "2865":"Master of Decor, World 1",
	   "2906":"Spirit of the Tiger",
	   "2963":"Dungeon Frequenter",
	   "2965":"Fractal Initiate",
	   "2992":"Hold the Line",
	   "2993":"Pursuit of Knowledge",
	   "2994":"Ley-Line Cartography",
	   "2995":"Magic Dispersed",
	   "2996":"Illustrious Legend",
	   "2999":"Long Arm of the Light",
	   "3002":"Bounty Hunter",
	   "3005":"Tip of the Blade",
	   "3018":"Long Arm of the Light II",
	   "3020":"Stay of Execution"
	}
	
}
