(function () {
	'use strict';
	const GUID = 'ed942f29-391b-4914-8dc3-ce527fd6d8cc';
	const MAX_SCORE = 850;
	const MIN_SCORE = 300;

	const urls = {
		spinnerUrl: chrome.runtime.getURL('css/images/spinner.svg'),
		activeIconUrl: chrome.runtime.getURL('css/images/logo.svg')
	}

	const scoreText = {
		scoreIncreased: 'Improving',
		scoreDecreased: 'Getting Worse',
		scoreNoHistory: 'No History'
	}

	const icons = {
		noChangeIcon: chrome.runtime.getURL('css/images/TrendNoChangeIcon.png'),
		improvingIcon: chrome.runtime.getURL('../css/images/TrendImprovingIcon.png'),
		decliningIcon: chrome.runtime.getURL('../css/images/TrendDecliningIcon.png')
	};

	if(document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded',start);
	} else {
		start()
	}


	function start() {
		console.log('starting');
		const body = document.getElementsByTagName('body')[0];
		const elChild = document.createElement('div');

		elChild.innerHTML = `
		  <div class="mtc-${GUID}">
			<div class="mth-${GUID}">
			  <img src=${urls.activeIconUrl} />
			  <a class="ct-${GUID} pmcl-${GUID}"></a>
			</div>
			<div class="pmse-${GUID}"></div>
			<div id="mtm-${GUID}">
			  <div id="pmd-${GUID}" class="mtd-${GUID}"></div>
			  <div id="mti-${GUID}">
				<div id="mtci-${GUID}"><img id="tcci-${GUID}" src="spinnerUrl"/></div>
				<div id="tcs-${GUID}"></div>
			  </div>
			</div>
		  </div>
		`;

		elChild.classList.add(GUID);
		body.appendChild(elChild);

		// set initial message
		chrome.runtime.sendMessage({msg: 'getPrivacyScore'});

		// set spinner element
		document.getElementById('tcci-' + GUID).src = urls.spinnerUrl;

		const modal = document.getElementsByClassName(GUID)[0];
		const closeBtn = document.getElementsByClassName('ct-' + GUID)[0];
		let displayModalTimeout;

		closeBtn.onclick = function() {
			modal.style.display = 'none';
			clearTimeout(displayModalTimeout);
		};

		// message listener
		chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
			switch(request.message) {
				case 'NotFound':
					setDisplayDomainNotFound(request);
					break;
				case 'ActiveTabScore':
					modal.style.display = 'block';
					displayModalTimeout = setTimeout(function () {
						modal.classList.add('pmh-' + GUID);
						setTimeout(function () {
							modal.classList.remove('pmh-' + GUID);
							modal.style.display = 'none';
						}, 1000);

					}, 1000 * 8);

					setDisplayDomainScore(request);
					break;
				case 'HiddenTabScore':
					setDisplayDomainScore(request);
					break;
				case 'ClickedOnIcon':
					modal.style.display = 'block';
					break;
				default:
					break;
			}
		});
	}

	function createScoreCicle(score, trend, status, previousScore) {
		let color;
		if (status === 'veryGood') {
			color = '#0d6db6';
		} else if (status === 'good') {
			color = '#71207a';
		} else if (status === 'fair') {
			color = '#af2283';
		} else if (status === 'veryPoor') {
			color = '#d62b80';
		} else if (status === 'exceptional') {
			color = '#00458f';
		}

		const valDecimal = (score - MIN_SCORE) / (MAX_SCORE - MIN_SCORE) * 100;
		const prevDecimal = previousScore ? (previousScore - MIN_SCORE) / (MAX_SCORE - MIN_SCORE) * 100 : null;

		Circles.create({
			id: `mtci-${GUID}`,
			value: valDecimal,
			maxValue: 100,
			radius: 30,
			text: `<img id="pmti-${GUID}" src="${trend}" />`,
			textClass: 'mtcts-' + GUID,
			width: 8,
			duration: 2,
			previousScore: prevDecimal,
			colors: ['#c4ced1', color]
		});
	}

	function sendUrlToAnalyze() {
		chrome.runtime.sendMessage({msg: 'requestReview'});
		document.getElementById('mtm-' + GUID).innerHTML = `<div id="padded-${GUID}">Your request has been received. Please allow up to 10 business days for this site to be reviewed.</div>`;
	}

	function showScoreStatus(score) {
		if (score < 580) {
			return [`<div id="pmsd-${GUID}" class="gst-veryPoor-${GUID}">Very Poor</div>`, 'veryPoor']
		} else if (score >= 580 && score < 670) {
			return [`<div id="pmsd-${GUID}" class="gst-fair-${GUID}">Fair</div>`, 'fair']
		} else if (score >= 670 && score < 740) {
			return [`<div id="pmsd-${GUID}" class="gst-good-${GUID}">Good</div>`, 'good']
		} else if (score >= 740 && score < 800) {
			return [`<div id="pmsd-${GUID}" class="gst-veryGood-${GUID}">Very Good</div>`, 'veryGood']
		} else {
			return [`<div id="pmsd-${GUID}" class="gst-exceptional-${GUID}">Exceptional</div>`, 'exceptional']
		}
	}

	function setDisplayDomainNotFound(request) {
		document.getElementById('mtm-' + GUID).innerHTML = `
			<div id="srta-${GUID}">
				<div id="padded-${GUID}">Sorry, we havent reviewed ${request.domain} yet.<br/>
					<br/>If you would like us to add it to the queue for our legal experts to review, hit the &quot;Request&quot; button now.
				</div>
				<br/>
				<button id="tbsend-${GUID}" onClick="sendUrlToAnalyze()">Request</button>
			</div>
		`;
	}

	function setDisplayDomainScore(request) {
		const score = Number(request.score);
		const previousScore = Number(request.previousScore);

		const span = showScoreStatus(score)[0];
		const status = showScoreStatus(score)[1];

		// trend default -- no change
		let trendClass = `gtt-nochange-${GUID}`;
		let trendText = 'No change';

		// set domain text to current browser hostname
		const domainTXT = document.getElementById('pmd-' + GUID);
		domainTXT.innerHTML = window.location.hostname;

		if (score === previousScore) {
			// defaults
			createScoreCicle(score, icons.noChangeIcon, status, previousScore);
		} else if (isNaN(previousScore)) {
			if (previousScore !== null) {
				if (score === previousScore) {
					createScoreCicle(score, icons.noChangeIcon, status, previousScore);
				} else if (score > previousScore) {
					trendClass = `gtt-increased-${GUID}`;
					trendText = `${scoreText.scoreIncreased}`;
					createScoreCicle(score, icons.improvingIcon, status, previousScore);
				}else if (score < previousScore) {
					trendClass = `gtt-decreased-${GUID}`;
					trendText = `${scoreText.scoreDecreased}`;
					createScoreCicle(score, icons.decliningIcon, status, previousScore);
				}
			} else {
				trendClass = `gtt-nochange-${GUID}`;
				trendText = `${scoreText.scoreNoHistory}`;
				createScoreCicle(score, icons.noChangeIcon, status,false);
			}
		} else if (previousScore === 0) {
			trendClass = `gtt-nochange-${GUID}`;
			trendText = `${scoreText.scoreNoHistory}`;
			createScoreCicle(score, icons.noChangeIcon, status,false);
		} else if (score > previousScore) {
			trendClass = `gtt-increased-${GUID}`;
			trendText = `${scoreText.scoreIncreased}`;
			createScoreCicle(score, icons.improvingIcon, status, previousScore);
		} else if (score < previousScore) {
			trendClass = `gtt-decreased-${GUID}`;
			trendText = `${scoreText.scoreDecreased}`;
			createScoreCicle(score, icons.decliningIcon, status, previousScore);
		}

		// set score and trend
		document.getElementById("tcs-" + GUID).innerHTML =
			`<div>Score: ${score}</div>
			${span}
			<div class="pmt-${GUID}">Trend: <span class="${trendClass}">${trendText}</span></div>`;
	}
}());