addresses = [
    {
        name: 'The Oval',
        address: 'The Oval, Oxford OX4 4SF',
        type: 'Iconic Roundabout',
        imgHeading: '0',
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
        imgHeading: '110',
        foursquareId: '4b746680f964a52037da2de3'
    },
    {
        name: 'The Isis Farmhouse',
        address: 'Haystacks Corner, The Towing Path, Iffley Lock, Oxford OX4 4EL',
        type: 'Pub',
        imgHeading: '0',
        foursquareId: '4bc9f561cc8cd13aa58bbccf'
    }
];

$(document).ready(function () {
    // Array that store all the markers
    markers = [];

    // Overall viewmodel for this screen, along with initial state
    function addressListViewModel() {
        // Store the addresses in the model for reference
        self = this;
        self.addresses = addresses;
        self.details = ko.observable("");
        self.sideBarCss = ko.observable(null);
        self.currentFilter = ko.observable("");

        // filter the addresses using the filter text input.
        self.filteredAddresses = ko.computed(function () {
            var filter = self.currentFilter().toLowerCase();
            if (!filter) {
                filterMarker(null); // display all the markers when there's no filter.
                resetMarkers(); // Reset marker animations.
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

        /**
         * Highlight and animate marker on the map.
         * @param index
         */
        highlightMarker = function (index) {
            var image = {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                size: new google.maps.Size(32, 32),
            };
            markers[index].marker.setOptions({
                icon: image,
                animation: google.maps.Animation.BOUNCE,
            });

        };
        /**
         * Remove marker highlighting and animation.
         * @param index
         */
        normalizeMarker = function (index) {
            markers[index].marker.setOptions({
                icon: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                animation: null
            });
        };

        // Open/Close Sidebar
        self.isOpen = ko.observable(false);
        self.toggleSidebar = function () {
            self.isOpen(!self.isOpen());
        };

        /**
         * Gets Venue details on the sidebar.
         * @param location
         */
        venueDetails = function (location) {
            if (location.foursquareId) {
                fetch(`https://api.foursquare.com/v2/venues/${location.foursquareId}?client_id=1BKMCGVM1HRJCOKKQYDFVQVTM5ZDXFKN0UIPG5BOLHAJ1YRC&client_secret=VEUNPBMEZRK1VSQXRRJOMAXCURUI2OL2HLB0TDFZJ3JLUMRA&v=20170801`)
                    .then(result => result.json())
                    .then(function (result) {
                        self.details(`<h2>Venue Details:</h2>
                                        <span>Name: ${result.response.venue.name}</span>
                                        <br>
                                        <span>Address: ${result.response.venue.location.formattedAddress}</span>
                                        <br>
                                        <span>Category: ${result.response.venue.categories[0].name}</span>
                                        <br>
                                        <span>Total Likes: ${result.response.venue.likes.summary}</span>
                                        <br>
                                        <span>Rating: <span style="color:#${result.response.venue.ratingColor}">${result.response.venue.rating}</span></span><span>/10</span>
                                        <br><br>                                        <br><br>
                                        <span class="attribution">Provided by: <b>Foursquare</b></span>
`);
                    }).catch(error => alert(`There seems to be an error getting the venue details: ${error}`));
            } else {
                self.details(`<span class="no-info">No Information for this location</span>`);
            }
        };

    }

    ko.applyBindings(new addressListViewModel());
});

/**
 * Initialise the map.
 */
function initMap() {
    var roseHill = {lat: 51.728129, lng: -1.231592};
    //makes the map accessible globally for other functions.
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: roseHill
    });

    //Build markers
    for (let i = 0; i < addresses.length; i++) {
        setTimeout(() => { // Adds a bit of delay for a nicer drop effect.
            getLatLng(addresses[i], map);
        }, i * 100);
    }
}

/**
 * Get the Lat and Long from a location and build the markers with it.
 * @param location
 * @param map
 */
function getLatLng(location, map) {
    place = location.address.replace(/ /g, '+');
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${place}&key=AIzaSyD2w_kTlp3yBsz_zc2Q72DxoD42Bm8b4vM`)
        .then(response => response.json())
        .then(function (data) {
            buildMarker(data, location, map);
        }).catch(e => alert(`Whoops, there seems to be an error getting the lat/long: ${e}`));
}

/**
 * This function waits on having the lat/long
 * to build the markers and push them to the
 * array "markers"
 * @param data
 * @param location
 * @param map
 */
function buildMarker(data, location, map) {
    var image = {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        size: new google.maps.Size(32, 32),
    };
    var marker = new google.maps.Marker({
        position: data.results[0].geometry.location,
        map: map,
        icon: image,
        animation: google.maps.Animation.DROP
    });

    // Push Marker to the array "Markers"
    markers.push({
        name: location.name,
        marker: marker
    });
    // Marker Details
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
        // Makes it bounce just once.
        setTimeout(function () {
            marker.setAnimation(null);
        }, 700);
    });

}


/**
 * Filters the markers
 * @param filter
 */
function filterMarker(filter) {
    if (filter === null) {
        for (let marker of markers) {
            marker.marker.setVisible(true);
        }
    } else {
        for (let marker of markers) {
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
    for (let i = 0; i < markers.length; i++) {
        normalizeMarker(i);
    }
};
