addresses = [
    {
        name: 'The Oval',
        address: 'The Oval, Oxford OX4 4SF',
        type: 'Iconic Roundabout',
        imgHeading: '0'
    },
    {
        name: 'Rose Hill Community Centre',
        address: 'Carole’s Way, Rose Hill, Oxford OX4 4HF',
        type: 'Gym',
        imgHeading: '0'
    },
    {
        name: 'Rose Hill News Agent',
        address: '23 The Oval, Oxford OX4 4SE, UK',
        type: 'Shop',
        imgHeading: '210'
    },
    {
        name: 'The Prince of Wales',
        address: '73 Church Way, Oxford OX4 4EF',
        type: 'Pub',
        imgHeading: '110'
    },
    {
        name: 'The Isis Farmhouse',
        address: 'Haystacks Corner, The Towing Path, Iffley Lock, Oxford OX4 4EL',
        type: 'Pub',
        imgHeading: '0'
    }
];

$(document).ready(function () {
    //Array that store all the markers
    markers = [];
    //Sidebar
    $('.sidebar-toggle').on('click', function () {
        $('.ui.sidebar')
            .sidebar('toggle')
        ;
    });

    // Overall viewmodel for this screen, along with initial state
    function addressListViewModel() {
        //Store the addresses in the model for reference
        self = this;
        self.addresses = addresses;

        self.currentFilter = ko.observable("");
        //filter the addresses using the filter text input.
        self.filteredAddresses = ko.computed(function () {
            var filter = self.currentFilter().toLowerCase();
            if (!filter) {
                filterMarker(null); // display all the markers when there's no filter.)
                resetMarkers();
                return self.addresses;
            } else {
                return ko.utils.arrayFilter(self.addresses, function (address, index) {
                    if (address.name.toLowerCase().includes(filter)) {
                        highlightMarker(index);
                        filterMarker(filter); // Display only the marker with matching addresses.
                    }
                    return address.name.toLowerCase().includes(filter); // Display filtered address on the list.

                });
            }
        }, self);

        highlightMarker = function (index) {
            var image = {
                url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                size: new google.maps.Size(32, 32),
            };
            markers[index].marker.setOptions({
                icon: image,
                animation: google.maps.Animation.BOUNCE,
            });

        }

        normalizeMarker = function (index) {
            markers[index].marker.setOptions({
                icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
                animation: null
            });
        }

    }

    ko.applyBindings(new addressListViewModel());
});


function initMap() {
    var roseHill = {lat: 51.728129, lng: -1.231592};
    window.map = new google.maps.Map(document.getElementById('map'), {
        draggable: false, //Keep the map focused on the neighbourhood.
        zoom: 16,
        center: roseHill
    });
    //Build markers
    for (place of addresses) {
        getLatLng(place, window.map);
    }
}


function getLatLng(location, map) {
    place = location.address.replace(/ /g, '+');
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=AIzaSyD2w_kTlp3yBsz_zc2Q72DxoD42Bm8b4vM`).then(response => response.json()).then(function (data) {
        buildMarker(data, location, map);
    }).catch(e => console.log(`Whoops, there seems to be an error: ${e}`));
}

function buildMarker(data, location, map) {
    var image = {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
        size: new google.maps.Size(32, 32),
    };
    var marker = new google.maps.Marker({
        position: data.results[0].geometry.location,
        map: map,
        icon: image
    });
    //Push Marker to the array "Markers"
    markers.push({
        name: location.name,
        marker: marker
    });

    var infowindow = new google.maps.InfoWindow({
        content: `<div style='float:left'>
                          <a href="https://maps.google.com/maps?ll=${data.results[0].geometry.location.lat},${data.results[0].geometry.location.lng}&z=16&t=m&hl=en&gl=US&mapclient=apiv3">
                            <img src="https://maps.googleapis.com/maps/api/streetview?size=200x100&location=${data.results[0].geometry.location.lat},${data.results[0].geometry.location.lng}&heading=${location.imgHeading}&pitch=-0.76&key=AIzaSyD2w_kTlp3yBsz_zc2Q72DxoD42Bm8b4vM">
                          </a>
                      </div>
                      <div style='float:right; padding: 10px;'>
                        <b>${location.name}</b>
                        <br/>
                         ${data.results[0].formatted_address}
                        <br>
                         ${location.type}
                      </div>`
    });

    marker.addListener('click', function () {
        infowindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        //Makes it bounce just once.
        setTimeout(function () {
            marker.setAnimation(null);
        }, 700)
    });

}


/**
 * Filters the markers
 * @param filter
 */
function filterMarker(filter) {
    if (filter === null) {
        for (marker of markers) {
            marker.marker.setVisible(true);
        }
    } else {
        for (marker of markers) {
            if (marker.name.toLowerCase().includes(filter)) {
                marker.marker.setVisible(true);
            } else {
                marker.marker.setVisible(false);
            }
        }
    }
}

/**
 * Resets the markers if there's no filter.
 */
resetMarkers = function () {
    for (marker in markers) {
        normalizeMarker(marker);
    }
}