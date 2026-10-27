function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	// Filter to just the written tweets
	tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	}).filter(function(tweet) {
		return tweet.written;
	});
}

function addEventHandlerForSearch() {
	// Search the written tweets as text is entered into the search box, and add them to the table
	const searchInput = document.getElementById('textFilter');
	const searchCount = document.getElementById('searchCount');
	const searchText = document.getElementById('searchText');
	const tweetTable = document.getElementById('tweetTable');

	// Update table when typing
	searchInput.addEventListener('input', function() {
		const query = searchInput.value.trim().toLowerCase();

		// Show current search text
		searchText.innerText = searchInput.value;

		// Empty query clears results
		if (query === '') {
			searchCount.innerText = '0';
			tweetTable.innerHTML = '';
			return;
		}

		// Find matching tweets
		const matchingTweets = tweet_array.filter(function(tweet) {
			return tweet.writtenText.toLowerCase().includes(query);
		});

		// Update count and table
		searchCount.innerText = matchingTweets.length;
		tweetTable.innerHTML = matchingTweets.map(function(tweet, index) {
			return tweet.getHTMLTableRow(index + 1);
		}).join('');
	});

	searchCount.innerText = '0';
	searchText.innerText = '';
	tweetTable.innerHTML = '';
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});