class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        // Identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        const t = this.text.toLowerCase();
        if (t.startsWith("just completed") ||
            t.startsWith("just posted") ||
            t.startsWith("completed")
        ) {
            return "completed_event";
        }
        if (t.includes("watch") && t.includes("right now") ||
            t.includes("rklive") ||
            t.includes("live ")
        ) {
            return "live_event";
        }
        if (t.includes("personal record") ||
            t.startsWith("new pb") ||
            t.includes("new personal best")
        ) {
            return "achievement";
        }
        return "miscellaneous";
    }

    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        // Identify whether the tweet is written
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        if(this.source != 'completed_event') {
            return "";
        }
        // Parse the written text from the tweet
        let clean = this.text
            .replace(/https?:\/\/\S+/g, "")
            .replace(/#Runkeeper/gi, "")
            .trim();
        
        clean = clean.replace(/\s*with @RunKeeper\. Check it out!\s*$/i, "");

        const index = clean.indexOf(" - ");
        if (index === -1) {
            return "";
        }
        return clean.substring(index + 3).trim();
    }

    get activityType():string {
        if (this.source != 'completed_event') {
            return "unknown";
        }
        // Parse the activity type from the text of the tweet
        const distMatch = this.text.match(/(?:a|an) [\d.]+ (?:km|mi) ([a-zA-Z ]+?)(?: with @Runkeeper| - | https|$)/);
        if (distMatch) {
            return distMatch[1].trim();
        }

        const timeMatch = this.text.match(/(?:a|an) ([a-zA-Z\/®\- ]+?) in [\d:]+/);
        if (timeMatch) {
            return timeMatch[1].trim();
        }
        return "unknown";
    }

    get distance():number {
        if(this.source != 'completed_event') {
            return 0;
        }
        // Parse the distance from the text of the tweet
        const match = this.text.match(/([\d.]+) (km|mi)/);
        if (!match) {
            return 0;
        }
        const value = parseFloat(match[1]);
        return match[2] === "km" ? value / 1.609 : value;
    }

    getHTMLTableRow(rowNumber:number):string {
        // Return a table row which summarizes the tweet with a clickable link to the RunKeeper activity
        const linked = this.text.replace(/https?:\/\/\S+/g, (url) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
        return `<tr><td>${rowNumber}</td><td>${this.activityType}</td><td>${linked}</td></tr>`;
    }
}