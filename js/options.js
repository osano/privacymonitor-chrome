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
		autooption: 'auto',
		screentime: 8
	}, function(items) {
		document.getElementById('autooption').value = items.autooption;
		document.getElementById('screentime').value = items.screentime;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);