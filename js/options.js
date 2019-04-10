function save_options() {
	var autooption = document.getElementById('autooption').value;
	chrome.storage.sync.set({
		autoOption: autooption
	}, function() {
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
			window.close()
		}, 750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		autoOption: 'auto'
	}, function(items) {
		document.getElementById('autooption').value = items.autoOption;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);