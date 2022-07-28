function getDeltaLatLon(lat, lng, dist) {
    const EARTH_RADIUS = 6371210;
    const DISTANCE = dist;

    function computeDeltaLon(degrees) {
        return Math.PI / 180 * EARTH_RADIUS * Math.cos(deg2rad(degrees))
    }

    function computeDeltaLat(degrees) {
        return 111132.954 - 559.882 * Math.cos(2 * deg2rad(degrees)) + 1.175 * Math.cos(4 * deg2rad(degrees))
    }

    function deg2rad(degrees) {
        return degrees * Math.PI / 180
    }

    const deltaLat = computeDeltaLat(lat)
    const deltaLon = computeDeltaLon(lng)

    const aroundLat = DISTANCE / deltaLat
    const aroundLon = DISTANCE / deltaLon

    return {lat: aroundLat, lon: aroundLon}
}

export {
    getDeltaLatLon
}