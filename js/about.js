function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;

	if (tweet_array.length === 0) {
		return;
	}

	// Find the earliest and latest tweets
	let earliest = tweet_array[0].time;
	let latest = tweet_array[0].time;
	for (const tweet of tweet_array) {
		if (tweet.time < earliest) {
			earliest = tweet.time;
		}
		if (tweet.time > latest) {
			latest = tweet.time;
		}
	}

	// Date formatting
	const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };

	document.getElementById('firstDate').innerText = earliest.toLocaleDateString('en-US', dateOptions);
	document.getElementById('lastDate').innerText = latest.toLocaleDateString('en-US', dateOptions);

	// Count the number of tweets of each type
	let completed = 0;
	let live = 0;
	let achievements = 0;
	let miscellaneous = 0;
	let written = 0;

	for (const tweet of tweet_array) {
		switch (tweet.source) {
			case 'completed_event':
				completed++;
				if (tweet.written) {
					written++;
				}
				break;

			case 'live_event':
				live++;
				break;

			case 'achievement':
				achievements++;
				break;

			default:
				miscellaneous++;
				break;
		}
	}

	// Calculate percentages
	const total = tweet_array.length;
	const percentage = (count, denominator) =>
		denominator === 0 ? '0.00%' :
			((count / denominator) * 100).toFixed(2) + '%';

	// Update counts for categories
	document.querySelectorAll('.completedEvents').forEach(function(element) { element.innerText = completed; });
    document.querySelector('.completedEventsPct').innerText = percentage(completed, total);

	document.querySelector('.liveEvents').innerText = live;
	document.querySelector('.liveEventsPct').innerText = percentage(live, total);

	document.querySelector('.achievements').innerText = achievements;
	document.querySelector('.achievementsPct').innerText = percentage(achievements, total);

	document.querySelector('.miscellaneous').innerText = miscellaneous;
	document.querySelector('.miscellaneousPct').innerText = percentage(miscellaneous, total);

	document.querySelector('.written').innerText = written;
	document.querySelector('.writtenPct').innerText = percentage(written, completed);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});