const socket = io();

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationMessageTemplate = document.querySelector(
	'#location-message-template'
).innerHTML;

socket.on('message', ({ message, createdAt }) => {
	const html = Mustache.render(messageTemplate, {
		message,
		createdAt: moment(createdAt).format('h:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

socket.on('locationMessage', ({ url, createdAt }) => {
	const html = Mustache.render(locationMessageTemplate, {
		url,
		createdAt: moment(createdAt).format('h:mm a')
	});
	$messages.insertAdjacentHTML('beforeend', html);
});

$messageForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const message = e.target.elements.message.value;

	if (message) {
		$messageFormButton.setAttribute('disabled', 'disabled');

		socket.emit('sendMessage', message, (err) => {
			$messageFormButton.removeAttribute('disabled');
			$messageFormInput.value = '';
			$messageFormInput.focus();

			if (err) {
				return console.log(err);
			}
		});
	}
});

$sendLocationButton.addEventListener('click', (e) => {
	if (!navigator.geolocation) {
		return alert('Geolocation is not supported by your browser');
	}
	$sendLocationButton.setAttribute('disabled', 'disabled');

	navigator.geolocation.getCurrentPosition((position) => {
		const { latitude, longitude } = position.coords;

		socket.emit('sendLocation', { latitude, longitude }, () => {
			$sendLocationButton.removeAttribute('disabled');
		});
	});
});
