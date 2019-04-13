function save_options() {
	let options = {};
	let elements = Array.prototype.slice.call(document.getElementsByTagName('select'));
		elements.forEach(function(e){
			options[e.id] = e.value;
		});
	chrome.storage.sync.set(options, function() {
		let status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
			window.close()
		}, 750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		autoOption: 'auto',
		screenTime: 8
	}, function(items) {
		document.getElementById('autoOption').value = items.autoOption;
		document.getElementById('screenTime').value = items.screenTime;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);