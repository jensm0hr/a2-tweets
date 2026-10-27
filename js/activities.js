function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	// Create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.
	const completedTweets = tweet_array.filter(function(tweet) {
        return tweet.source === 'completed_event' && tweet.activityType !== 'unknown';
    });

	// Count the number of tweets of each activity type and sort for Vega-Lite
	const activityCounts = {};
	for (const tweet of completedTweets) {
		const activity = tweet.activityType;
		activityCounts[activity] = (activityCounts[activity] || 0) + 1;
	}
	const activityData = Object.keys(activityCounts).map(function(activity) {
        return {
            activity: activity,
            count: activityCounts[activity]
        };
    });
	activityData.sort(function(a, b) {
		return b.count - a.count;
	});

	document.getElementById('numberActivities').innerText = activityData.length;

	const topThree = activityData.slice(0, 3).map(function(item) {
		return item.activity;
	});

	document.getElementById('firstMost').innerText = topThree[0] || 'N/A';
    document.getElementById('secondMost').innerText = topThree[1] || 'N/A';
    document.getElementById('thirdMost').innerText = topThree[2] || 'N/A';

	// Number of tweets per activity chart
	const activity_vis_spec = {
	  	"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
	  	"description": "A graph of the number of Tweets containing each type of activity.",
	  	"data": { "values": activityData },
	  	mark: "bar",
	  	encoding: {
			x: { field: "activity", type: "nominal", sort: "-y", axis: { labelAngle: -45 } },
			y: { field: "count", type: "quantitative", title: "Number of Tweets" },
			tooltip: [
		  		{ field: "activity", type: "nominal" },
		  		{ field: "count", type: "quantitative" }
			]
	  	},
	  	autosize: {
			type: "pad",
			contains: "padding"
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	// Create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	const distanceTweets = completedTweets.filter(function(tweet) {
        return topThree.includes(tweet.activityType) &&
            tweet.distance > 0 &&
            Number.isFinite(tweet.distance);
    });

	const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

	const distanceData = distanceTweets.map(function(tweet) {
        return {
            activity: tweet.activityType,
            distance: tweet.distance,
            day: dayNames[tweet.time.getDay()],
            dayNumber: tweet.time.getDay(),
            dayType: tweet.time.getDay() === 0 ||
                     tweet.time.getDay() === 6
                ? 'Weekend'
                : 'Weekday'
        };
    });

	// Calculate mean distances for each of the top three activities
	const activityMeans = topThree.map(function(activity) {
        const distances = distanceData.filter(function(item) {
            return item.activity === activity;
        });

        const totalDistance = distances.reduce(function(sum, item) {
            return sum + item.distance;
        }, 0);

        return {
            activity: activity,
            meanDistance: distances.length
                ? totalDistance / distances.length
                : 0
        };
    });

	// Which activity has longest/shortest mean distance
	const activitiesWithDistances = activityMeans.filter(function(item) {
		return item.meanDistance > 0;
	});
	activitiesWithDistances.sort(function(a, b) {
		return b.meanDistance - a.meanDistance;
	});

	document.getElementById('longestActivityType').innerText =
        activitiesWithDistances[0]?.activity || 'N/A';

    document.getElementById('shortestActivityType').innerText =
        activitiesWithDistances[
            activitiesWithDistances.length - 1
        ]?.activity || 'N/A';

	let weekdayTotal = 0;
	let weekdayCount = 0;
	let weekendTotal = 0;
	let weekendCount = 0;

	for (const item of distanceData) {
		if (item.dayType === 'Weekend') {
			weekendTotal += item.distance;
			weekendCount++;
		}
		else {
			weekdayTotal += item.distance;
			weekdayCount++;
		}
	}

	// Average distances for weekdays and weekends
	const weekdayAverage = weekdayCount ? weekdayTotal / weekdayCount : 0;
	const weekendAverage = weekendCount ? weekendTotal / weekendCount : 0;

	document.getElementById('weekdayOrWeekendLonger').innerText =
        weekdayAverage > weekendAverage
            ? 'weekdays'
            : weekendAverage > weekdayAverage
                ? 'weekends'
                : 'weekdays and weekends equally';

	// Individual activity distances by day chart
	const distance_vis_spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'Individual distances by day of week',
        data: { values: distanceData },
        mark: { type: 'point', opacity: 0.5 },
        encoding: {
            x: {
                field: 'day',
                type: 'ordinal',
                sort: [
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
                    'Thursday', 'Friday', 'Saturday'
                ],
                title: 'Day of Week'
            },
            y: {
                field: 'distance',
                type: 'quantitative',
                title: 'Distance (Miles)'
            },
            color: {
                field: 'activity',
                type: 'nominal',
                title: 'Activity Type'
            },
            tooltip: [
                { field: 'activity', type: 'nominal' },
                { field: 'day', type: 'ordinal' },
                {
                    field: 'distance',
                    type: 'quantitative',
                    title: 'Miles',
                    format: '.2f'
                }
            ]
        },
        width: 'container'
    };

	// Mean distance by day and activity chart
	const distance_vis_aggregated_spec = {
        $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
        description: 'Mean distance by day of week and activity',
        data: { values: distanceData },
        mark: 'line',
        encoding: {
            x: {
                field: 'day',
                type: 'ordinal',
                sort: [
                    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
                    'Thursday', 'Friday', 'Saturday'
                ],
                title: 'Day of Week'
            },
            y: {
                aggregate: 'mean',
                field: 'distance',
                type: 'quantitative',
                title: 'Mean Distance (Miles)'
            },
            color: {
                field: 'activity',
                type: 'nominal',
                title: 'Activity Type'
            },
            point: { filled: true },
            tooltip: [
                { field: 'activity', type: 'nominal' },
                { field: 'day', type: 'ordinal' },
                {
                    aggregate: 'mean',
                    field: 'distance',
                    type: 'quantitative',
                    title: 'Mean Miles',
                    format: '.2f'
                }
            ]
        },
        width: 'container'
    };

	vegaEmbed('#distanceVis', distance_vis_spec, { actions: false });
	vegaEmbed('#distanceVisAggregated', distance_vis_aggregated_spec, { actions: false });

	// First show individual distances
	document.getElementById('distanceVis').style.display = 'block';
	document.getElementById('distanceVisAggregated').style.display = 'none';

	// Toggle between individual distances and means
	const aggregateButton = document.getElementById('aggregate');
	aggregateButton.innerText = 'Show Means';
	aggregateButton.onclick = function() {
        const individual = document.getElementById('distanceVis');
        const aggregated = document.getElementById('distanceVisAggregated');
        if (aggregated.style.display === 'none') {
            individual.style.display = 'none';
            aggregated.style.display = 'block';
            aggregateButton.innerText = 'Show individual distances';
        }
		else {
            individual.style.display = 'block';
            aggregated.style.display = 'none';
            aggregateButton.innerText = 'Show means';
        }
        window.dispatchEvent(new Event('resize'));
    };
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});